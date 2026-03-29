# Data Models

All TypeScript types are defined in `src/types/index.ts`.

---

## Post

Represents a piece of content (e.g., Instagram post).

```typescript
type PostStatus = "draft" | "scheduled" | "published" | "archived";

interface Post {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  publishDate: string | null;  // ISO 8601 date string
  createdAt: string;
  updatedAt: string;
}
```

---

## Planned Models

### InstagramPost
Extends `Post` with Instagram-specific fields:
- `mediaUrl` — image/video URL
- `hashtags` — array of hashtag strings
- `instagramPostId` — ID returned by Instagram API after publishing
- `likes`, `comments`, `reach` — analytics metrics

### Competitor
- `id`, `name`, `instagramHandle`
- `followersCount`, `avgEngagementRate`
- `lastCheckedAt`

### NewsItem
- `id`, `title`, `url`, `source`, `publishedAt`
- `summary`
