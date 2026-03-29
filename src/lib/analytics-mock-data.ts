import { PostType } from "@/types/index";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DailyMetric {
  date: string;         // "Mar 29"
  impressions: number;
  reach: number;
  engagementRate: number; // e.g. 3.4 (percent)
  likes: number;
  comments: number;
  saves: number;
  followersGained: number;
  totalFollowers: number;
}

export interface TopPost {
  id: string;
  caption: string;
  type: PostType;
  impressions: number;
  engagementRate: number;
  likes: number;
  comments: number;
  saves: number;
  publishDate: string;
  gradientClass: string;
}

export type DateRange = "7d" | "30d" | "90d";

// ─── Deterministic pseudo-random (seeded) ───────────────────────────────────

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

// ─── Generate daily metrics (180 days, fixed seed = reproducible) ───────────

const BASE_DATE = new Date(2026, 2, 29); // Mar 29 2026

function buildMetrics(): DailyMetric[] {
  const rand = lcg(0xdeadbeef);
  const DAYS = 180;
  let followers = 7_840;
  const out: DailyMetric[] = [];

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(BASE_DATE);
    d.setDate(d.getDate() - i);

    const dow         = d.getDay();
    const isWeekend   = dow === 0 || dow === 6;
    const wBoost      = isWeekend ? 1.4 : 1;
    const trend       = 1 + ((DAYS - i) / DAYS) * 0.30; // 30% upward drift

    const impressions = Math.round((2_600 + rand() * 1_800) * wBoost * trend);
    const reach       = Math.round(impressions * (0.60 + rand() * 0.18));
    const likes       = Math.round((65 + rand() * 130) * wBoost * trend);
    const comments    = Math.round((5 + rand() * 28) * wBoost);
    const saves       = Math.round((8 + rand() * 40) * trend);
    const engRate     = parseFloat(((likes + comments + saves) / reach * 100).toFixed(1));
    const gained      = Math.round((2 + rand() * 20) * (isWeekend ? 1.6 : 1));
    followers        += gained;

    out.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      impressions,
      reach,
      engagementRate: Math.min(engRate, 12),
      likes,
      comments,
      saves,
      followersGained: gained,
      totalFollowers: followers,
    });
  }

  return out;
}

const ALL_METRICS = buildMetrics();

export function getMetrics(range: DateRange): DailyMetric[] {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return ALL_METRICS.slice(ALL_METRICS.length - days);
}

export function getPreviousMetrics(range: DateRange): DailyMetric[] {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return ALL_METRICS.slice(ALL_METRICS.length - days * 2, ALL_METRICS.length - days);
}

// ─── Summary helpers ─────────────────────────────────────────────────────────

export interface SummaryStats {
  totalImpressions: number;
  avgEngagementRate: number;
  totalFollowers: number;
  followersGained: number;
}

export function summarise(data: DailyMetric[]): SummaryStats {
  if (data.length === 0) return { totalImpressions: 0, avgEngagementRate: 0, totalFollowers: 0, followersGained: 0 };
  return {
    totalImpressions:  data.reduce((s, d) => s + d.impressions, 0),
    avgEngagementRate: parseFloat((data.reduce((s, d) => s + d.engagementRate, 0) / data.length).toFixed(1)),
    totalFollowers:    data[data.length - 1].totalFollowers,
    followersGained:   data.reduce((s, d) => s + d.followersGained, 0),
  };
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}

// ─── Top Posts ───────────────────────────────────────────────────────────────

export const TOP_POSTS: TopPost[] = [
  {
    id: "tp1",
    caption: "Founder story — how the idea started, the early struggles, what kept us going. A 60-second raw reel.",
    type: "reel",
    impressions: 18_420,
    engagementRate: 7.2,
    likes: 942,
    comments: 147,
    saves: 183,
    publishDate: "Mar 25, 2026",
    gradientClass: "from-pink-900/80 to-rose-800/80",
  },
  {
    id: "tp2",
    caption: "Customer testimonial carousel — 5 quotes from power users with profile photos and key results.",
    type: "carousel",
    impressions: 14_830,
    engagementRate: 5.8,
    likes: 621,
    comments: 89,
    saves: 142,
    publishDate: "Mar 20, 2026",
    gradientClass: "from-blue-900/80 to-cyan-800/80",
  },
  {
    id: "tp3",
    caption: "Morning routine tips — 5 habits that save 30 minutes every day. Time-lapse with text overlays.",
    type: "reel",
    impressions: 12_560,
    engagementRate: 6.1,
    likes: 534,
    comments: 78,
    saves: 164,
    publishDate: "Mar 15, 2026",
    gradientClass: "from-purple-900/80 to-violet-800/80",
  },
  {
    id: "tp4",
    caption: "Behind-the-scenes look at our product photoshoot — raw moments and natural light.",
    type: "carousel",
    impressions: 9_840,
    engagementRate: 4.9,
    likes: 398,
    comments: 52,
    saves: 87,
    publishDate: "Mar 10, 2026",
    gradientClass: "from-amber-900/80 to-orange-800/80",
  },
];

// ─── Formatters ──────────────────────────────────────────────────────────────

export function fmtNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
