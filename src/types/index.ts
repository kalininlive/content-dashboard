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
