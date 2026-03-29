import { Competitor, CompetitorPost, Platform } from "@/types/index";

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

// ─── Growth data ──────────────────────────────────────────────────────────────
// Returns 30 daily cumulative follower counts ending at `endFollowers`

function growthData(endFollowers: number, totalGained: number, seed: number): number[] {
  const rand      = lcg(seed);
  const startF    = endFollowers - Math.abs(totalGained);
  const weights   = Array.from({ length: 30 }, () => rand());
  const sumW      = weights.reduce((s, w) => s + w, 0);
  const dailyGain = weights.map((w) => Math.round((w / sumW) * totalGained));

  let f = startF;
  return dailyGain.map((g) => { f += g; return f; });
}

// ─── Recent posts ─────────────────────────────────────────────────────────────

const POST_COPY: Record<Platform, string[]> = {
  instagram: [
    "How we grew from 0 to 100K followers in 6 months 📈",
    "5 social media trends you need to know in 2026",
    "Behind the scenes: our full content creation process",
    "The only posting schedule you'll ever need (swipe →)",
    "Why consistency beats virality every time ✅",
  ],
  youtube: [
    "Complete social media strategy for 2026 (full guide)",
    "I tested every scheduling tool — here's the verdict",
    "How top brands are winning on Instagram Reels right now",
    "The content calendar system that changed everything for us",
    "Algorithm changes explained: what actually matters in 2026",
  ],
  tiktok: [
    "Social media tip you didn't know you needed 👀 #growthhack",
    "POV: when your content finally hits the For You page 🚀",
    "The scheduling hack that saves me 3 hours a week ⏰",
    "Content routine: idea to publish in under 1 hour 💡",
    "Stop doing this on your brand account right now ❌",
  ],
  twitter: [
    "Thread: 15 things I learned growing 3 social accounts from scratch",
    "Hot take: scheduling tools actually killed authentic social media",
    "The engagement formula nobody talks about (and why it matters) 🧵",
    "We analysed 1,000 viral posts. Here's exactly what they had in common.",
    "Unpopular opinion: more platforms = less overall results. Here's why.",
  ],
  linkedin: [
    "How we built a content system that essentially runs on autopilot",
    "The social media metrics that actually matter in 2026",
    "What 5 years of content marketing taught me about audience building",
    "Why most social strategies fail — and the simple fix that works",
    "From 0 to 100K: the exact growth framework we used, step by step",
  ],
};

const POST_TYPES: Record<Platform, string[]> = {
  instagram: ["Image", "Carousel", "Reel", "Story"],
  youtube:   ["Video", "Short"],
  tiktok:    ["Video"],
  twitter:   ["Post", "Thread"],
  linkedin:  ["Article", "Post"],
};

function genPosts(platform: Platform, seed: number, count = 5): CompetitorPost[] {
  const rand    = lcg(seed);
  const today   = new Date(2026, 2, 29);
  const copies  = POST_COPY[platform];
  const types   = POST_TYPES[platform];
  const posts: CompetitorPost[] = [];

  for (let i = 0; i < count; i++) {
    const daysAgo  = i === 0 ? 0 : Math.round(2 + rand() * 5) + (i - 1) * 3;
    const d        = new Date(today);
    d.setDate(d.getDate() - daysAgo);

    const likes    = Math.round(800 + rand() * 18_000);
    const comments = Math.round(likes * (0.02 + rand() * 0.09));
    const shares   = Math.round(likes * (0.01 + rand() * 0.07));
    const reach    = Math.round(likes * (6 + rand() * 14));
    const er       = parseFloat(((likes + comments + shares) / reach * 100).toFixed(1));

    posts.push({
      id: `${seed}-p${i}`,
      content: copies[i % copies.length],
      type:    types[Math.floor(rand() * types.length)],
      date:    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      likes,
      comments,
      shares,
      engagementRate: Math.min(er, 15),
    });
  }

  return posts;
}

// ─── Avatar gradients ─────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-violet-600 to-indigo-600",
  "from-pink-600 to-rose-600",
  "from-blue-600 to-cyan-600",
  "from-emerald-600 to-teal-600",
  "from-orange-500 to-amber-500",
  "from-red-600 to-orange-500",
  "from-cyan-600 to-sky-600",
  "from-purple-600 to-pink-600",
];

// ─── Initial competitor list ──────────────────────────────────────────────────

export const INITIAL_COMPETITORS: Competitor[] = [
  {
    id: "c1",
    name: "Buffer",
    handle: "@buffer",
    platform: "instagram",
    avatarGradient: GRADIENTS[0],
    followers: 461_000,
    growth30d: growthData(461_000, 9_600, 0x11aa11aa),
    gainedLast30d: 9_600,
    avgEngagementRate: 3.8,
    postsPerWeek: 5,
    totalPosts: 4_820,
    lastPostDate: "2026-03-28",
    recentPosts: genPosts("instagram", 0x11aa11aa),
    addedAt: "2026-03-01",
  },
  {
    id: "c2",
    name: "Hootsuite",
    handle: "@hootsuite",
    platform: "instagram",
    avatarGradient: GRADIENTS[1],
    followers: 308_000,
    growth30d: growthData(308_000, 6_300, 0x22bb22bb),
    gainedLast30d: 6_300,
    avgEngagementRate: 2.9,
    postsPerWeek: 7,
    totalPosts: 6_140,
    lastPostDate: "2026-03-29",
    recentPosts: genPosts("instagram", 0x22bb22bb),
    addedAt: "2026-03-01",
  },
  {
    id: "c3",
    name: "Later",
    handle: "@latermedia",
    platform: "instagram",
    avatarGradient: GRADIENTS[2],
    followers: 201_000,
    growth30d: growthData(201_000, 5_400, 0x33cc33cc),
    gainedLast30d: 5_400,
    avgEngagementRate: 5.1,
    postsPerWeek: 4,
    totalPosts: 3_210,
    lastPostDate: "2026-03-27",
    recentPosts: genPosts("instagram", 0x33cc33cc),
    addedAt: "2026-03-05",
  },
  {
    id: "c4",
    name: "Sprout Social",
    handle: "@sproutsocial",
    platform: "linkedin",
    avatarGradient: GRADIENTS[3],
    followers: 128_000,
    growth30d: growthData(128_000, 4_200, 0x44dd44dd),
    gainedLast30d: 4_200,
    avgEngagementRate: 3.4,
    postsPerWeek: 3,
    totalPosts: 2_890,
    lastPostDate: "2026-03-26",
    recentPosts: genPosts("linkedin", 0x44dd44dd),
    addedAt: "2026-03-08",
  },
  {
    id: "c5",
    name: "Planable",
    handle: "@planable",
    platform: "twitter",
    avatarGradient: GRADIENTS[4],
    followers: 47_200,
    growth30d: growthData(47_200, 2_550, 0x55ee55ee),
    gainedLast30d: 2_550,
    avgEngagementRate: 4.2,
    postsPerWeek: 6,
    totalPosts: 1_450,
    lastPostDate: "2026-03-29",
    recentPosts: genPosts("twitter", 0x55ee55ee),
    addedAt: "2026-03-10",
  },
  {
    id: "c6",
    name: "Metricool",
    handle: "@metricool",
    platform: "youtube",
    avatarGradient: GRADIENTS[5],
    followers: 31_400,
    growth30d: growthData(31_400, 1_860, 0x66ff66ff),
    gainedLast30d: 1_860,
    avgEngagementRate: 6.2,
    postsPerWeek: 2,
    totalPosts: 820,
    lastPostDate: "2026-03-25",
    recentPosts: genPosts("youtube", 0x66ff66ff),
    addedAt: "2026-03-15",
  },
  {
    id: "c7",
    name: "ContentStudio",
    handle: "@contentstudioio",
    platform: "tiktok",
    avatarGradient: GRADIENTS[6],
    followers: 23_100,
    growth30d: growthData(23_100, 1_440, 0x7700ff00),
    gainedLast30d: 1_440,
    avgEngagementRate: 7.8,
    postsPerWeek: 6,
    totalPosts: 560,
    lastPostDate: "2026-03-28",
    recentPosts: genPosts("tiktok", 0x7700ff00),
    addedAt: "2026-03-20",
  },
  {
    id: "c8",
    name: "Loomly",
    handle: "@loomly",
    platform: "twitter",
    avatarGradient: GRADIENTS[7],
    followers: 18_400,
    growth30d: growthData(18_400, 750, 0x8800ff88),
    gainedLast30d: 750,
    avgEngagementRate: 3.1,
    postsPerWeek: 4,
    totalPosts: 1_820,
    lastPostDate: "2026-03-24",
    recentPosts: genPosts("twitter", 0x8800ff88),
    addedAt: "2026-03-22",
  },
];

// ─── Add competitor from user input ──────────────────────────────────────────

export function generateCompetitor(
  name: string,
  handle: string,
  platform: Platform
): Competitor {
  const seed = (name.charCodeAt(0) * 0x1234abcd) ^ (handle.length * 0xdeadbeef);
  const rand = lcg(seed);

  const followerRange: Record<Platform, [number, number]> = {
    instagram: [8_000, 600_000],
    youtube:   [3_000, 250_000],
    tiktok:    [5_000, 900_000],
    twitter:   [2_000, 400_000],
    linkedin:  [1_500, 180_000],
  };

  const [min, max] = followerRange[platform];
  const followers  = Math.round(min + rand() * (max - min));
  const gained     = Math.round(followers * (0.005 + rand() * 0.025));

  return {
    id: `gen-${Date.now()}`,
    name,
    handle: handle.startsWith("@") ? handle : `@${handle}`,
    platform,
    avatarGradient: GRADIENTS[Math.floor(rand() * GRADIENTS.length)],
    followers,
    growth30d: growthData(followers, gained, seed),
    gainedLast30d: gained,
    avgEngagementRate: parseFloat((1.5 + rand() * 7.5).toFixed(1)),
    postsPerWeek: Math.round(1 + rand() * 6),
    totalPosts: Math.round(100 + rand() * 4_000),
    lastPostDate: `2026-03-${String(Math.round(10 + rand() * 19)).padStart(2, "0")}`,
    recentPosts: genPosts(platform, seed),
    addedAt: "2026-03-29",
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function fmtN(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function daysAgo(dateStr: string): string {
  const today = new Date(2026, 2, 29);
  const d     = new Date(dateStr);
  const diff  = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)   return `${diff}d ago`;
  if (diff < 30)  return `${Math.round(diff / 7)}w ago`;
  return `${Math.round(diff / 30)}mo ago`;
}
