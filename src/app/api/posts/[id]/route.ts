import { auth } from "@/lib/auth"
import { db } from "@/db"
import { posts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

// PATCH /api/posts/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { id } = await params
  const body = await req.json()

  const updates: Partial<typeof posts.$inferInsert> = { updatedAt: new Date() }
  if (body.status !== undefined) updates.status = body.status
  if (body.caption !== undefined) updates.caption = body.caption
  if (body.hashtags !== undefined) updates.hashtags = body.hashtags
  if (body.mediaUrls !== undefined) updates.mediaUrls = body.mediaUrls
  if (body.musicUrl !== undefined) updates.musicUrl = body.musicUrl
  if (body.publishDate !== undefined)
    updates.publishDate = body.publishDate ? new Date(body.publishDate) : null
  if (body.postType !== undefined) updates.postType = body.postType
  if (body.approvedAt !== undefined) updates.approvedAt = body.approvedAt ? new Date() : null

  const [updated] = await db
    .update(posts)
    .set(updates)
    .where(eq(posts.id, id))
    .returning()

  if (!updated) return new Response("Post not found", { status: 404 })
  return Response.json({ post: updated })
}

// DELETE /api/posts/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { id } = await params
  await db.delete(posts).where(eq(posts.id, id))
  return Response.json({ ok: true })
}
