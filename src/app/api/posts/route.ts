import { auth } from "@/lib/auth"
import { db } from "@/db"
import { posts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest } from "next/server"

// GET /api/posts?status=idea|draft|scheduled|published|failed
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const query = db.select().from(posts).orderBy(desc(posts.createdAt))

  const result = status
    ? await query.where(eq(posts.status, status))
    : await query

  return Response.json({ posts: result })
}

// POST /api/posts — create a new post
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const body = await req.json()

  const [post] = await db
    .insert(posts)
    .values({
      status: body.status ?? "idea",
      postType: body.postType ?? "image",
      caption: body.caption ?? null,
      hashtags: body.hashtags ?? [],
      mediaUrls: body.mediaUrls ?? [],
      musicUrl: body.musicUrl ?? null,
      publishDate: body.publishDate ? new Date(body.publishDate) : null,
    })
    .returning()

  return Response.json({ post }, { status: 201 })
}
