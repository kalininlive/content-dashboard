import { db } from "@/db"
import { adminSettings, igSnapshots, igPosts } from "@/db/schema"
import { scrapeInstagramProfile } from "@/lib/apify"
import { NextRequest } from "next/server"

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) return new Response("Unauthorized", { status: 401 })

  const [settings] = await db.select().from(adminSettings).limit(1)
  if (!settings?.igUsername) {
    return Response.json({ skipped: "no igUsername configured" })
  }

  try {
    const profile = await scrapeInstagramProfile(settings.igUsername, 30)

    const avgLikes =
      profile.latestPosts.length > 0
        ? profile.latestPosts.reduce((s, p) => s + p.likesCount, 0) / profile.latestPosts.length
        : 0
    const avgComments =
      profile.latestPosts.length > 0
        ? profile.latestPosts.reduce((s, p) => s + p.commentsCount, 0) / profile.latestPosts.length
        : 0
    const avgEr =
      profile.followersCount > 0
        ? ((avgLikes + avgComments) / profile.followersCount) * 100
        : 0

    await db.insert(igSnapshots).values({
      igUsername: profile.username,
      followers: profile.followersCount,
      following: profile.followsCount,
      postsCount: profile.postsCount,
      avgLikes,
      avgComments,
      avgEr,
      biography: profile.biography,
    })

    for (const post of profile.latestPosts) {
      await db
        .insert(igPosts)
        .values({
          igId: post.id,
          igUsername: profile.username,
          caption: post.caption,
          mediaUrl: post.mediaUrl,
          likes: post.likesCount,
          comments: post.commentsCount,
          postType: post.type,
          shortcode: post.shortCode,
          timestamp: new Date(post.timestamp),
        })
        .onConflictDoNothing()
    }

    return Response.json({ ok: true, followers: profile.followersCount })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown"
    return Response.json({ error: message }, { status: 500 })
  }
}
