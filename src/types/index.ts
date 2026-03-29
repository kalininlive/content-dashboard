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
