# Architecture

## Frontend

**Framework:** Next.js 15 with App Router

- React Server Components used by default for pages
- Client Components (`"use client"`) only where interactivity is needed
- File-based routing under `src/app/`
- Dashboard module routes: `src/app/dashboard/[module]/page.tsx`

## UI Layer

**shadcn/ui** — component library built on Radix UI primitives + Tailwind CSS

Components available:
- `Button` — `src/components/ui/button.tsx`
- `Card` — `src/components/ui/card.tsx`
- `Input` — `src/components/ui/input.tsx`
- `Dialog` — `src/components/ui/dialog.tsx`

Utilities: `src/lib/utils.ts` (cn helper for class merging)

## Data Layer

**Current:** Mock data (static objects in `src/lib/`)

**Planned:**
- Database: TBD (Supabase / Prisma)
- External APIs: Instagram Graph API
- Server Actions for mutations

## Type System

All shared types defined in `src/types/index.ts`.

## Deployment

Target: Vercel (zero-config with Next.js)
Environment variables managed via Vercel dashboard + `.env.local` for local dev.
