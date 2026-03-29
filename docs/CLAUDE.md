# Content Dashboard — Developer Context

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Components | shadcn/ui | 4.1.1 |
| Icons | lucide-react | ^1.7.0 |
| Runtime | Node.js | v24.1.0 |
| Package manager | npm | 11.3.0 |

**Dev server command:** `npm run dev` (uses `--webpack` flag — Turbopack disabled, see Decisions)

---

## Folder Structure

```
src/
  app/
    layout.tsx              ← Root layout: applies dark class globally, Geist font
    page.tsx                ← Redirects / → /dashboard
    globals.css             ← Tailwind imports + shadcn CSS variables (light + dark)
    dashboard/
      layout.tsx            ← Dashboard shell: Sidebar + <main> scroll container
      page.tsx              ← Overview: module card grid
      instagram/page.tsx    ← Instagram Manager placeholder
      analytics/page.tsx    ← Analytics placeholder
      calendar/page.tsx     ← Content Calendar (static month grid)
      competitors/page.tsx  ← Competitor Tracker placeholder
      news/page.tsx         ← News Aggregator placeholder
  components/
    sidebar.tsx             ← Client component: nav links with active-state highlight
    ui/                     ← shadcn/ui components (do not edit manually)
      button.tsx
      card.tsx
      input.tsx
      dialog.tsx
  lib/
    utils.ts                ← cn() helper (clsx + tailwind-merge)
  types/
    index.ts                ← Shared TypeScript types (Post, PostStatus)
docs/
  CLAUDE.md                 ← This file — always update when making structural changes
  ARCHITECTURE.md           ← System design overview
  DATA_MODELS.md            ← TypeScript type definitions and planned models
README.md                   ← Project overview for GitHub
```

---

## Component Standards

- **shadcn/ui components** live in `src/components/ui/`. Never edit them directly — re-run `npx shadcn@latest add <component>` to update.
- **Client components** (`"use client"`) only when required (event handlers, hooks, browser APIs). All pages are React Server Components by default.
- **Icons** — use `lucide-react` exclusively. Import only what you use.
- **CSS classes** — compose with `cn()` from `@/lib/utils` when merging conditional Tailwind classes.
- **Dark theme** is enforced globally via `class="dark"` on `<html>`. No light-mode styles needed. All components use shadcn CSS variables which resolve correctly in dark context.

---

## Current State

### Implemented
- Dark theme applied globally (`dark` class on `<html>`)
- Root redirects `/` → `/dashboard`
- Dashboard shell layout: fixed sidebar (240px) + scrollable main area
- Sidebar navigation with active-state highlight for all 6 routes
- Overview page with module card grid
- 5 module placeholder pages with headers, stat cards, and empty states:
  - Instagram Manager (`/dashboard/instagram`)
  - Analytics (`/dashboard/analytics`)
  - Calendar (`/dashboard/calendar`) — includes static month grid
  - Competitors (`/dashboard/competitors`)
  - News Feed (`/dashboard/news`)
- Base TypeScript types: `Post`, `PostStatus` in `src/types/index.ts`

### Not Yet Implemented
- Real data fetching (all data is static / empty state)
- Authentication
- Instagram Graph API integration
- Analytics data integration
- Database / persistence layer
- RSS feed parsing for news aggregator

---

## Next Steps

1. Build Instagram post list with mock data (`src/lib/mock-data.ts`)
2. Create post create/edit form using Dialog + Input components
3. Make calendar interactive (click day → create post)
4. Add competitor search and tracking UI
5. Implement RSS feed parser for News module
6. Set up database (Supabase recommended for auth + storage)

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| `dark` class on `<html>` | Enforces dark mode globally without user toggle — simpler for a tool/dashboard |
| `--webpack` dev flag | Machine CPU lacks `bmi2` instruction set; Turbopack panics on startup |
| App Router + RSC | All pages server-rendered by default; client components only where needed |
| shadcn/ui | Copy-paste components — full ownership, no version-lock surprises |
| Tailwind CSS v4 | Configured by shadcn init; uses `@import` syntax, no `tailwind.config.js` |
| lucide-react for icons | Same icon set shadcn/ui uses internally — consistent visual language |
| No auth yet | UI-first approach: iterate on layout/features before adding auth complexity |
| Mock data deferred | Build real UI first, then wire real data — avoids premature API coupling |
