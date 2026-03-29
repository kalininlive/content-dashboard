# Content Dashboard

A social media content management dashboard built with Next.js.

## Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Deployment:** Vercel

## Modules
- **Instagram Manager** — content creation, scheduling, and publishing
- **Analytics** — performance metrics and insights
- **Calendar** — content planning and scheduling overview
- **Competitors** — competitor account tracking and analysis
- **News** — industry news feed

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    dashboard/
      instagram/   # Instagram Manager module
      analytics/   # Analytics module
      calendar/    # Content Calendar module
      competitors/ # Competitors module
      news/        # News Feed module
  components/
    ui/            # shadcn/ui components
  lib/             # Utilities
  types/           # TypeScript type definitions
docs/              # Project documentation
```

## Docs
See [/docs](./docs) for architecture, data models, and development context.
