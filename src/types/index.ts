export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export interface Post {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  publishDate: string | null;
  createdAt: string;
  updatedAt: string;
}
