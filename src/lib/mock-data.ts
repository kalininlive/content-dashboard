import { InstagramPost } from "@/types/index";

export const mockPosts: InstagramPost[] = [
  // ── Backlog / Ideas ──────────────────────────────────────────────────────
  {
    id: "1",
    description:
      "Behind-the-scenes look at our product photoshoot — raw moments, natural light, genuine reactions from the team.",
    postType: "carousel",
    status: "idea",
    publishDate: null,
    tags: ["bts", "photoshoot"],
    createdAt: "2026-03-25T10:00:00Z",
  },
  {
    id: "2",
    description:
      "Quick morning routine tips that save 30 minutes a day. Time-lapse style reel with text overlays.",
    postType: "reel",
    status: "idea",
    publishDate: null,
    tags: ["productivity", "routine"],
    createdAt: "2026-03-26T09:00:00Z",
  },
  {
    id: "3",
    description:
      "Poll story — asking followers what content they want to see more of this month.",
    postType: "story",
    status: "idea",
    publishDate: null,
    tags: ["engagement", "poll"],
    createdAt: "2026-03-26T14:00:00Z",
  },

  // ── Drafts ───────────────────────────────────────────────────────────────
  {
    id: "4",
    description:
      "Product feature highlight — the new dashboard layout and what makes it different from existing tools.",
    postType: "image",
    status: "draft",
    publishDate: null,
    tags: ["product", "feature"],
    createdAt: "2026-03-27T11:00:00Z",
  },
  {
    id: "5",
    description:
      "Customer testimonial carousel — 5 quotes from power users with their profile photos and company names.",
    postType: "carousel",
    status: "draft",
    publishDate: null,
    tags: ["social-proof", "testimonial"],
    createdAt: "2026-03-27T14:00:00Z",
  },

  // ── Scheduled ────────────────────────────────────────────────────────────
  {
    id: "6",
    description:
      "April launch announcement — bold typography, brand colors, short punchy copy. Going live on launch day.",
    postType: "image",
    status: "scheduled",
    publishDate: "2026-04-01T09:00:00Z",
    tags: ["launch", "announcement"],
    createdAt: "2026-03-28T08:00:00Z",
  },
  {
    id: "7",
    description:
      "Founder story — how the idea started, the early struggles, what kept us going. 60-second reel.",
    postType: "reel",
    status: "scheduled",
    publishDate: "2026-04-05T12:00:00Z",
    tags: ["founder", "story"],
    createdAt: "2026-03-28T16:00:00Z",
  },

  // ── Published ────────────────────────────────────────────────────────────
  {
    id: "8",
    description:
      "March recap — top metrics, key wins, and a sneak peek at what we're building in April.",
    postType: "carousel",
    status: "published",
    publishDate: "2026-03-31T10:00:00Z",
    tags: ["recap", "metrics"],
    createdAt: "2026-03-20T10:00:00Z",
  },
];
