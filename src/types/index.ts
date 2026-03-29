// ─── Instagram ─────────────────────────────────────────────────────────────

export type PostType = "image" | "carousel" | "reel" | "story";
export type PostStatus = "idea" | "draft" | "scheduled" | "published";

export interface InstagramPost {
  id: string;
  description: string;
  postType: PostType;
  status: PostStatus;
  publishDate: string | null; // ISO 8601
  tags: string[];
  createdAt: string;
}

// ─── Calendar ──────────────────────────────────────────────────────────────

export type Platform = "instagram" | "youtube" | "tiktok" | "twitter" | "linkedin";
export type CalendarStatus = "published" | "scheduled" | "draft";

export interface CalendarPost {
  id: string;
  title: string;
  platform: Platform;
  type: string;        // "Reel" | "Video" | "Article" | "Post" | "Short" | "Story"
  status: CalendarStatus;
  date: string;        // "YYYY-MM-DD"
  time: string;        // "HH:MM"
  description?: string;
}

// ─── Competitors ───────────────────────────────────────────────────────────

export interface CompetitorPost {
  id: string;
  content: string;
  type: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  avatarGradient: string;
  followers: number;
  growth30d: number[];       // 30 daily follower counts (cumulative)
  gainedLast30d: number;
  avgEngagementRate: number;
  postsPerWeek: number;
  totalPosts: number;
  lastPostDate: string;      // "YYYY-MM-DD"
  recentPosts: CompetitorPost[];
  addedAt: string;
}

// ─── Generic (future use) ───────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  publishDate: string | null;
  createdAt: string;
  updatedAt: string;
}
