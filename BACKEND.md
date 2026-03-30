# Backend Architecture — Production Guide

> Текущее состояние: **frontend-only, mock data**.
> Этот документ описывает полную схему backend'а для продакшен-деплоя.

---

## Обзор архитектуры

```
Browser (Next.js App Router)
  │
  ├── /app/api/*          ← Next.js API Routes (Edge/Node runtime)
  │     ├── auth/         ← NextAuth.js (Google OAuth)
  │     ├── instagram/    ← Proxy → Meta Graph API
  │     ├── analytics/    ← Proxy → Meta Insights API
  │     ├── posts/        ← CRUD → Vercel Postgres
  │     ├── calendar/     ← CRUD → Vercel Postgres
  │     ├── competitors/  ← CRUD → Vercel Postgres
  │     └── news/         ← Fetch → RSS / NewsAPI
  │
  ├── Vercel Postgres (Neon)   ← основная БД
  ├── Vercel KV (Redis)        ← кэш + сессии
  └── Vercel Blob              ← загрузка изображений
```

---

## 1. Аутентификация

### Технология: NextAuth.js v5

```bash
npm install next-auth@beta
```

### Провайдеры
| Провайдер | Зачем |
|-----------|-------|
| Google OAuth | основной вход |
| Instagram (Meta) | для привязки аккаунта |

### Файлы
```
src/app/api/auth/[...nextauth]/route.ts   ← NextAuth handler
src/lib/auth.ts                           ← конфиг + getSession helper
src/middleware.ts                         ← защита /dashboard/* роутов
```

### `src/middleware.ts`
```ts
export { auth as middleware } from "@/lib/auth"
export const config = { matcher: ["/dashboard/:path*"] }
```

### Переменные окружения
```env
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.vercel.app

GOOGLE_CLIENT_ID=<из Google Cloud Console>
GOOGLE_CLIENT_SECRET=<из Google Cloud Console>

# После подключения Instagram:
META_APP_ID=<из developers.facebook.com>
META_APP_SECRET=<из developers.facebook.com>
```

---

## 2. База данных — Vercel Postgres (Neon)

### Подключение
1. Vercel Dashboard → Storage → Create → Postgres
2. Подключить к проекту → переменные добавятся автоматически

```bash
npm install @vercel/postgres drizzle-orm drizzle-kit
```

### Схема (`src/db/schema.ts`)

```ts
import { pgTable, text, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"

// Пользователи (создаёт NextAuth автоматически)
export const users = pgTable("users", {
  id:        text("id").primaryKey().$defaultFn(() => createId()),
  name:      text("name"),
  email:     text("email").notNull().unique(),
  image:     text("image"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Instagram аккаунты (привязанные к пользователю)
export const igAccounts = pgTable("ig_accounts", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  userId:       text("user_id").notNull().references(() => users.id),
  igUserId:     text("ig_user_id").notNull(),      // ID в Meta
  igUsername:   text("ig_username").notNull(),
  accessToken:  text("access_token").notNull(),    // Meta long-lived token
  tokenExpiry:  timestamp("token_expiry"),
  createdAt:    timestamp("created_at").defaultNow(),
})

// Посты
export const posts = pgTable("posts", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  userId:      text("user_id").notNull().references(() => users.id),
  igAccountId: text("ig_account_id").references(() => igAccounts.id),
  description: text("description"),
  postType:    text("post_type").notNull(),         // image | carousel | reel | story
  status:      text("status").notNull(),            // idea | draft | scheduled | published
  publishDate: timestamp("publish_date"),
  tags:        text("tags").array(),
  mediaUrls:   text("media_urls").array(),          // Vercel Blob URLs
  igPostId:    text("ig_post_id"),                  // ID поста в Instagram (после публикации)
  createdAt:   timestamp("created_at").defaultNow(),
  updatedAt:   timestamp("updated_at").defaultNow(),
})

// Конкуренты
export const competitors = pgTable("competitors", {
  id:               text("id").primaryKey().$defaultFn(() => createId()),
  userId:           text("user_id").notNull().references(() => users.id),
  name:             text("name").notNull(),
  handle:           text("handle").notNull(),
  platform:         text("platform").notNull(),
  followers:        integer("followers"),
  avgEngagementRate: real("avg_engagement_rate"),
  postsPerWeek:     real("posts_per_week"),
  lastPostDate:     timestamp("last_post_date"),
  growth30d:        jsonb("growth_30d").$type<number[]>(),
  updatedAt:        timestamp("updated_at").defaultNow(),
})

// Snapshots метрик конкурентов (история)
export const competitorSnapshots = pgTable("competitor_snapshots", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  competitorId: text("competitor_id").notNull().references(() => competitors.id),
  followers:    integer("followers"),
  engagement:   real("engagement"),
  recordedAt:   timestamp("recorded_at").defaultNow(),
})
```

### Миграции
```bash
npx drizzle-kit generate
npx drizzle-kit migrate    # локально
# На Vercel: запускается автоматически через postbuild script
```

---

## 3. Instagram / Meta Graph API

### Что даёт API
| Данные | Endpoint |
|--------|----------|
| Профиль | `GET /me?fields=id,name,username,followers_count` |
| Посты | `GET /{ig-user-id}/media` |
| Метрики поста | `GET /{media-id}/insights?metric=impressions,reach,engagement` |
| Аккаунт-метрики | `GET /{ig-user-id}/insights?metric=impressions,reach,follower_count` |
| Публикация фото | `POST /{ig-user-id}/media` + `POST /{ig-user-id}/media_publish` |

### Получение токена
1. Создать приложение на [developers.facebook.com](https://developers.facebook.com)
2. Добавить продукт **Instagram Graph API**
3. Получить `short-lived token` → обменять на **long-lived (60 дней)**
4. Периодически обновлять: `GET /refresh_access_token?grant_type=ig_refresh_token&access_token={token}`

### API Route (`src/app/api/instagram/media/route.ts`)
```ts
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { igAccounts } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const [account] = await db
    .select()
    .from(igAccounts)
    .where(eq(igAccounts.userId, session.user.id))
    .limit(1)

  if (!account) return Response.json({ posts: [] })

  const res = await fetch(
    `https://graph.instagram.com/v21.0/${account.igUserId}/media` +
    `?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count` +
    `&access_token=${account.accessToken}`
  )
  const data = await res.json()
  return Response.json(data)
}
```

### Переменные окружения
```env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=https://your-app.vercel.app/api/auth/instagram/callback
```

---

## 4. Analytics — Meta Insights API

### Ключевые метрики аккаунта
```
GET https://graph.instagram.com/v21.0/{ig-user-id}/insights
  ?metric=impressions,reach,follower_count,profile_views
  &period=day
  &since=1704067200   ← unix timestamp
  &until=1706745600
  &access_token={token}
```

### Caching на Vercel KV
```bash
npm install @vercel/kv
```

```ts
import { kv } from "@vercel/kv"

const CACHE_KEY = `analytics:${userId}:${dateRange}`
const cached = await kv.get(CACHE_KEY)
if (cached) return Response.json(cached)

// ... fetch from Meta
await kv.set(CACHE_KEY, data, { ex: 3600 }) // 1 hour TTL
```

### Переменные окружения (Vercel KV — добавляются автоматически)
```env
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

---

## 5. News Feed

### Технология: RSS + NewsAPI

```bash
npm install rss-parser
```

### Источники (RSS)
```ts
const RSS_FEEDS = [
  "https://techcrunch.com/category/social/feed/",
  "https://www.socialmediaexaminer.com/feed/",
  "https://buffer.com/resources/feed/",
  "https://sproutsocial.com/insights/feed/",
]
```

### Дополнительно: NewsAPI
```env
NEWS_API_KEY=<from newsapi.org — бесплатный план: 100 req/day>
```

### Caching (Vercel KV, TTL 15 мин)
```ts
const cached = await kv.get("news:feed")
// refresh каждые 15 минут через cron
```

### Cron Job (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-news",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/refresh-analytics",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/refresh-competitors",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

## 6. Загрузка изображений — Vercel Blob

```bash
npm install @vercel/blob
```

```ts
import { put } from "@vercel/blob"

// POST /api/upload
const { url } = await put(file.name, file, { access: "public" })
// url → сохранить в posts.mediaUrls[]
```

### Переменные окружения (добавляются автоматически)
```env
BLOB_READ_WRITE_TOKEN=...
```

---

## 7. Все переменные окружения (итого)

### Обязательные
```env
# Auth
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Meta / Instagram
META_APP_ID=
META_APP_SECRET=
INSTAGRAM_REDIRECT_URI=https://your-app.vercel.app/api/auth/instagram/callback
```

### Добавляются Vercel автоматически (через Storage)
```env
# Vercel Postgres
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
POSTGRES_HOST=

# Vercel KV
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```

### Опциональные
```env
# News
NEWS_API_KEY=

# Cron security (защита endpoint от посторонних)
CRON_SECRET=<openssl rand -base64 32>
```

---

## 8. Порядок настройки (Step by Step)

```
1. Vercel → Import Project (github.com/kalininlive/content-dashboard)
2. Vercel → Storage → Create Postgres → Connect to project
3. Vercel → Storage → Create KV → Connect to project
4. Vercel → Storage → Create Blob → Connect to project
5. Добавить вручную NEXTAUTH_SECRET, NEXTAUTH_URL
6. Google Cloud Console → OAuth 2.0 → добавить redirect URI
   → добавить GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
7. developers.facebook.com → создать приложение
   → Instagram Graph API → получить токены
   → добавить META_APP_ID, META_APP_SECRET
8. npx drizzle-kit migrate (или добавить в package.json "postbuild")
9. Push → Vercel auto-deploys
```

---

## 9. Структура новых файлов

```
src/
  app/
    api/
      auth/
        [...nextauth]/route.ts    ← NextAuth handler
        instagram/callback/route.ts
      posts/route.ts              ← GET/POST /api/posts
      posts/[id]/route.ts         ← PATCH/DELETE
      instagram/media/route.ts    ← GET real IG posts
      analytics/route.ts          ← GET insights
      competitors/route.ts        ← GET/POST
      news/route.ts               ← GET news feed
      upload/route.ts             ← POST image to Blob
      cron/
        refresh-news/route.ts
        refresh-analytics/route.ts
        refresh-competitors/route.ts
  db/
    schema.ts                     ← Drizzle schema
    index.ts                      ← db client
  lib/
    auth.ts                       ← NextAuth config
    meta.ts                       ← Meta Graph API helpers
    news.ts                       ← RSS parser helpers
```

---

## 10. Замена mock-данных на реальные

| Файл с mock | Заменить на |
|-------------|-------------|
| `src/lib/mock-data.ts` | `fetch("/api/instagram/media")` + SWR/React Query |
| `src/lib/analytics-mock-data.ts` | `fetch("/api/analytics")` |
| `src/lib/competitors-mock-data.ts` | `fetch("/api/competitors")` |
| `src/lib/news-mock-data.ts` | `fetch("/api/news")` |
| `src/lib/calendar-mock-data.ts` | `fetch("/api/posts?status=scheduled")` |

### Рекомендуемый data-fetching: SWR
```bash
npm install swr
```
```ts
const { data, isLoading } = useSWR("/api/posts", fetcher, {
  refreshInterval: 60_000  // авто-обновление каждую минуту
})
```
