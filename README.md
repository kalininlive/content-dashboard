# Content Dashboard

A social media content management dashboard built with Next.js 16 + React 19.

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/base-ui, Recharts
- **i18n:** EN / RU
- **Deployment:** Vercel

## Modules

| Module | Description |
|--------|-------------|
| **Overview** | Hub page with quick stats and module navigation |
| **Instagram Manager** | Post management — ideas, drafts, scheduled, published |
| **Analytics** | Impressions, reach, engagement rate, follower growth charts |
| **Calendar** | Multi-platform content calendar with day detail view |
| **Competitors** | Competitor tracking — followers, engagement, 30d trend sparklines |
| **News** | Industry news aggregator with category filters |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    dashboard/         # All dashboard routes
      instagram/
      analytics/
      calendar/
      competitors/
      news/
  components/
    ui/                # Base UI components (card, button, etc.)
    instagram/
    analytics/
    calendar/
    competitors/
    news/
  lib/                 # Utilities, mock data, i18n
  locales/             # en.json, ru.json
  types/               # TypeScript types
```

## Design System

The UI uses a **2026 premium dark aesthetic**:
- Deep navy-black base (`oklch(0.10 0.018 265)`)
- Electric violet primary accent (`oklch(0.65 0.26 285)`) with glow effects
- Gradient-border cards via CSS `mask-composite` technique
- Fully responsive — mobile slide-in drawer sidebar at `< 1024px`
- Smooth cubic-bezier micro-interactions throughout

## Backend / Production

See [BACKEND.md](./BACKEND.md) for the full production architecture:
- NextAuth.js authentication (Google OAuth)
- Vercel Postgres (Neon) database schema with Drizzle ORM
- Meta Graph API integration (Instagram posts + analytics)
- Vercel KV caching + cron jobs
- All environment variables documented

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
