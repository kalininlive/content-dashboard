import { auth } from "@/lib/auth"
import { db } from "@/db"
import { igPosts } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 100)

  const posts = await db
    .select()
    .from(igPosts)
    .orderBy(desc(igPosts.timestamp))
    .limit(limit)

  return Response.json({ posts })
}
