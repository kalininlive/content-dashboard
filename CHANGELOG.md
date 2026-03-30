# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-03-29

### UI/UX — 2026 Premium Redesign

#### Design System (`src/app/globals.css`)
- Replaced flat gray palette with chromatic **navy-black** base (`oklch(0.10 0.018 265)`) — deep, warm dark with subtle blue chroma
- New **electric violet** primary accent (`oklch(0.65 0.26 285)`) with glow variable `--primary-glow`
- Added vivid semantic status colors: `--success` (emerald), `--warning` (amber)
- Updated chart palette to match new accent system
- Increased global border radius to `0.75rem` (was `0.625rem`) — softer, more premium feel
- Added `@layer utilities`:
  - `.gradient-border` — 1px gradient border via CSS `mask-composite` trick (violet → transparent → violet)
  - `.glow-primary` / `.glow-primary-sm` — box-shadow glow effects
  - `.sidebar-logo-glow` / `.sidebar-mesh-bg` — sidebar-specific effects
  - `.dashboard-hero` — radial gradient mesh for overview hero section
- Added smooth `cubic-bezier(0.22, 1, 0.36, 1)` micro-transitions on all interactive elements

#### Sidebar (`src/components/sidebar.tsx`)
- Added optional `onClose?: () => void` prop for mobile drawer integration
- Logo icon now renders with violet glow (`sidebar-logo-glow`)
- Radial gradient mesh background for depth
- Nav items redesigned: icon wrapped in `h-7 w-7 rounded-lg` container
- Active state: `bg-sidebar-accent` + `ring-1` violet border + icon gets `bg-primary/20 text-primary`
- Footer: "Live" pulse indicator + pill-style language switcher (active = `bg-primary`)
- "MAIN" section label with wide letter-spacing uppercase

#### Dashboard Layout (`src/app/dashboard/layout.tsx`)
- Converted to Client Component to support mobile state
- **Mobile responsive**: hamburger menu → slide-in drawer sidebar with `backdrop-blur` overlay
- Sidebar visible at `lg:` (1024px+), hidden below with drawer pattern
- Mobile top bar: 56px height, sticky, blurred background
- Transition: `cubic-bezier(0.22, 1, 0.36, 1)` 300ms

#### Overview Page (`src/app/dashboard/page.tsx`)
- **Hero section**: gradient mesh background, "Dashboard Active" pill badge with pulse dot, large `text-3xl/4xl` heading
- **Quick stats row**: 4 tiles (`grid-cols-2 lg:grid-cols-4`) — Posts, Reach, Scheduled, Tracked
  - Each tile: top accent gradient line, icon in `bg-primary/10` square, large bold number
- **Module cards**: `gradient-border` utility, `ArrowUpRight` indicator, icon in `bg-primary/15 rounded-xl`
  - Hover: `shadow-[0_0_30px_oklch(0.65_0.26_285_/_0.10)]` violet glow
  - Footer row with stat + "Open →" link text

#### Card Component (`src/components/ui/card.tsx`)
- `rounded-xl` → `rounded-2xl` across all sub-components
- Ring opacity `ring-foreground/10` → `ring-foreground/8` (subtler border)
- CardFooter background `bg-muted/50` → `bg-muted/30` (lighter against dark bg)

#### Button Component (`src/components/ui/button.tsx`)
- Default variant: hover glow `shadow-[0_0_16px_oklch(0.65_0.26_285_/_0.4)]` + `active:scale-[0.98]`

#### i18n (`src/locales/en.json`, `src/locales/ru.json`)
- Added `dashboard.stats.*` keys: `posts`, `reach`, `scheduled`, `tracked` (EN + RU)

---

## Previous

### [0.5.0] — News Aggregator + i18n
- EN/RU internationalization with context-based i18n system
- News feed module with category tabs and search

### [0.4.0] — Competitors Tracker
- Sortable table with sparklines and detail panel

### [0.3.0] — Content Calendar
- Month view with platform filters and day detail panel

### [0.2.0] — Analytics Dashboard
- KPI cards, line/area/bar charts with Recharts

### [0.1.0] — Instagram Manager
- Post management with status tabs, create/edit dialog
