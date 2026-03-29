import { CalendarPost, CalendarStatus, Platform } from "@/types/index";

// ─── Platform metadata ───────────────────────────────────────────────────────

export interface PlatformMeta {
  label: string;
  shortLabel: string;
  chipBg: string;      // Tailwind classes: bg + text
  chipBorder: string;  // border color class
  dotColor: string;    // bg class for the dot
  filterActive: string;
  filterInactive: string;
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  instagram: {
    label: "Instagram",
    shortLabel: "IG",
    chipBg: "bg-pink-500/10 text-pink-300",
    chipBorder: "border-pink-500/30",
    dotColor: "bg-pink-500",
    filterActive: "bg-pink-500/20 text-pink-300 border-pink-500/50",
    filterInactive: "bg-transparent text-muted-foreground border-border/50 hover:border-pink-500/30 hover:text-pink-300",
  },
  youtube: {
    label: "YouTube",
    shortLabel: "YT",
    chipBg: "bg-red-500/10 text-red-300",
    chipBorder: "border-red-500/30",
    dotColor: "bg-red-500",
    filterActive: "bg-red-500/20 text-red-300 border-red-500/50",
    filterInactive: "bg-transparent text-muted-foreground border-border/50 hover:border-red-500/30 hover:text-red-300",
  },
  tiktok: {
    label: "TikTok",
    shortLabel: "TK",
    chipBg: "bg-cyan-500/10 text-cyan-300",
    chipBorder: "border-cyan-500/30",
    dotColor: "bg-cyan-400",
    filterActive: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
    filterInactive: "bg-transparent text-muted-foreground border-border/50 hover:border-cyan-500/30 hover:text-cyan-300",
  },
  twitter: {
    label: "X",
    shortLabel: "X",
    chipBg: "bg-sky-500/10 text-sky-300",
    chipBorder: "border-sky-500/30",
    dotColor: "bg-sky-400",
    filterActive: "bg-sky-500/20 text-sky-300 border-sky-500/50",
    filterInactive: "bg-transparent text-muted-foreground border-border/50 hover:border-sky-500/30 hover:text-sky-300",
  },
  linkedin: {
    label: "LinkedIn",
    shortLabel: "LI",
    chipBg: "bg-blue-500/10 text-blue-300",
    chipBorder: "border-blue-500/30",
    dotColor: "bg-blue-500",
    filterActive: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    filterInactive: "bg-transparent text-muted-foreground border-border/50 hover:border-blue-500/30 hover:text-blue-300",
  },
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_META) as Platform[];

// ─── Helper ──────────────────────────────────────────────────────────────────

export function getPostsByDate(posts: CalendarPost[], date: string): CalendarPost[] {
  return posts.filter((p) => p.date === date).sort((a, b) => a.time.localeCompare(b.time));
}

// ─── Raw post data ───────────────────────────────────────────────────────────

function p(
  id: string,
  date: string,
  time: string,
  platform: Platform,
  type: string,
  title: string,
  description?: string
): CalendarPost {
  // Status logic: past = published, today/near-future = mixed, future = scheduled
  const today = "2026-03-29";
  const status: CalendarStatus = date < today ? "published" : date === today ? "scheduled" : "scheduled";
  return { id, title, platform, type, status, date, time, description };
}

export const CALENDAR_POSTS: CalendarPost[] = [
  // ── February 2026 ────────────────────────────────────────────────────────
  p("f01", "2026-02-03", "09:00", "instagram", "Reel",     "February product launch teaser — raw, unfiltered behind-the-scenes footage."),
  p("f02", "2026-02-05", "15:00", "youtube",   "Video",    "Full walkthrough: how we built our MVP in 30 days", "12-minute deep-dive."),
  p("f03", "2026-02-07", "11:00", "tiktok",    "Short",    "POV: building a startup from your living room 😅"),
  p("f04", "2026-02-10", "09:30", "instagram", "Carousel", "5 productivity hacks that actually work — illustrated tips."),
  p("f05", "2026-02-10", "14:00", "linkedin",  "Article",  "Why we chose Next.js over the alternatives", "Detailed engineering decision post."),
  p("f06", "2026-02-12", "10:00", "twitter",   "Post",     "Hot take: the best UX is no UX 🧵"),
  p("f07", "2026-02-14", "09:00", "instagram", "Story",    "Valentine's Day — love letters to our users ❤️"),
  p("f08", "2026-02-14", "17:00", "tiktok",    "Short",    "Valentines for developers 💕 #devhumor"),
  p("f09", "2026-02-17", "10:00", "youtube",   "Short",    "30-second tip: keyboard shortcut that saves 10 min/day"),
  p("f10", "2026-02-19", "09:00", "instagram", "Image",    "Team photo from our first offsite in Lisbon 🇵🇹"),
  p("f11", "2026-02-21", "11:30", "twitter",   "Post",     "What we learned shipping 3 features in one week 🧵"),
  p("f12", "2026-02-24", "09:00", "instagram", "Reel",     "A day in the life — startup founder edition. No filter."),
  p("f13", "2026-02-26", "15:00", "youtube",   "Video",    "We tried every project management tool so you don't have to", "8-min comparison."),
  p("f14", "2026-02-28", "09:00", "instagram", "Carousel", "February recap: 3 wins, 2 failures, 1 lesson we'll never forget."),
  p("f15", "2026-02-28", "12:00", "linkedin",  "Article",  "The single metric that changed how our team works"),

  // ── March 2026 ───────────────────────────────────────────────────────────
  p("m01", "2026-03-03", "09:00", "instagram", "Reel",     "New month, new energy — here's what we're building in March."),
  p("m02", "2026-03-05", "15:00", "youtube",   "Video",    "Tutorial: setting up a Next.js dashboard from scratch", "15-min tutorial."),
  p("m03", "2026-03-07", "10:00", "linkedin",  "Article",  "Remote-first culture: what actually works vs. what sounds good"),
  p("m04", "2026-03-10", "09:00", "instagram", "Carousel", "Behind the data: how our users really use the product."),
  p("m05", "2026-03-10", "13:00", "tiktok",    "Short",    "Expectation vs. reality: startup edition 🎬"),
  p("m06", "2026-03-12", "10:30", "youtube",   "Short",    "60-second tip: stop writing comments, write better code"),
  p("m07", "2026-03-14", "09:00", "instagram", "Image",    "Pi Day special — our team's favourite irrational decisions 🥧"),
  p("m08", "2026-03-14", "16:00", "twitter",   "Post",     "Unpopular opinion: more meetings would actually help us 🧵"),
  p("m09", "2026-03-17", "09:00", "instagram", "Story",    "Monday motivation — lessons from week 10 of building."),
  p("m10", "2026-03-17", "14:00", "twitter",   "Post",     "We hit 5K followers today. Here's a thread of things we got wrong."),
  p("m11", "2026-03-19", "15:00", "youtube",   "Video",    "How we reduced our page load time by 60%", "Technical deep-dive."),
  p("m12", "2026-03-21", "09:00", "instagram", "Reel",     "Founder story — the moment we almost gave up."),
  p("m13", "2026-03-21", "17:00", "linkedin",  "Article",  "What our first 100 users taught us about product-market fit"),
  p("m14", "2026-03-24", "09:00", "instagram", "Carousel", "Tools we use daily — the honest list (no affiliates)."),
  p("m15", "2026-03-24", "11:00", "tiktok",    "Short",    "Startup red flags you should ignore 🚩 (and ones you shouldn't)"),
  p("m16", "2026-03-25", "10:00", "instagram", "Reel",     "Founder story — how the idea started, the struggles, what kept us going."),
  p("m17", "2026-03-27", "15:00", "youtube",   "Video",    "Building a content dashboard: architecture decisions explained"),
  p("m18", "2026-03-27", "12:00", "twitter",   "Post",     "Things I wish I knew before building a SaaS product 🧵"),

  // ── March 29 (today — mix) ───────────────────────────────────────────────
  p("m19", "2026-03-29", "09:00", "instagram", "Image",    "Q1 is almost over — here's our honest scorecard."),
  p("m20", "2026-03-29", "17:00", "linkedin",  "Article",  "Why we ditched OKRs after 2 quarters"),

  // ── March 30–31 (near-future scheduled) ─────────────────────────────────
  p("m21", "2026-03-31", "09:00", "instagram", "Carousel", "March recap — top metrics, wins, and what we're building in April."),
  p("m22", "2026-03-31", "14:00", "tiktok",    "Short",    "Month wrap-up: 3 things that surprised us 😮"),
  p("m23", "2026-03-31", "16:00", "youtube",   "Short",    "We're shipping something big in April... 👀"),

  // ── April 2026 ───────────────────────────────────────────────────────────
  p("a01", "2026-04-01", "09:00", "instagram", "Image",    "It's launch day 🚀 — introducing ContentDash to the world."),
  p("a02", "2026-04-01", "09:30", "twitter",   "Post",     "We're live! Everything we built and why 🧵 #buildinpublic"),
  p("a03", "2026-04-01", "10:00", "youtube",   "Video",    "Full launch demo: ContentDash walkthrough in 8 minutes"),
  p("a04", "2026-04-01", "12:00", "linkedin",  "Article",  "From idea to launch in 90 days: what we actually did"),
  p("a05", "2026-04-03", "10:00", "instagram", "Story",    "Day 3 post-launch — the numbers, the bugs, the love ❤️"),
  p("a06", "2026-04-05", "12:00", "instagram", "Reel",     "Founder story: the moment we almost quit (and didn't)."),
  p("a07", "2026-04-05", "15:00", "tiktok",    "Short",    "Launch week survival guide for founders 😅"),
  p("a08", "2026-04-07", "09:00", "instagram", "Carousel", "5 things we changed based on Day 1 user feedback."),
  p("a09", "2026-04-08", "14:00", "youtube",   "Video",    "How to build a content calendar for social media in 2026"),
  p("a10", "2026-04-10", "09:00", "instagram", "Image",    "Week 1 in the books — here are the real numbers."),
  p("a11", "2026-04-10", "11:00", "twitter",   "Post",     "Lessons from our first week post-launch 🧵"),
  p("a12", "2026-04-12", "15:00", "instagram", "Reel",     "How we handle customer feedback (the honest version)."),
  p("a13", "2026-04-12", "10:00", "linkedin",  "Article",  "Post-launch reflection: what changed in our thinking"),
  p("a14", "2026-04-15", "09:00", "instagram", "Carousel", "Mid-April product update — 3 new features, 2 fixes, 1 removal."),
  p("a15", "2026-04-15", "16:00", "youtube",   "Video",    "Building with users: how we shipped 3 features in one sprint"),
  p("a16", "2026-04-17", "10:00", "tiktok",    "Short",    "How I manage my social media content in 1 hour/week 📱"),
  p("a17", "2026-04-20", "09:00", "instagram", "Reel",     "Behind the scenes of our April content sprint."),
];
