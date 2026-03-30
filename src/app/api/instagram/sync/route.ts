import { auth } from "@/lib/auth"
import { db } from "@/db"
import { adminSettings, igSnapshots, igPosts } from "@/db/schema"
import { scrapeInstagramProfile } from "@/lib/apify"

export async function POST() {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const [settings] = await db.select().from(adminSettings).limit(1)
  if (!settings?.igUsername) {
    return Response.json({ error: "Instagram username not configured" }, { status: 400 })
  }

  try {
    const profile = await scrapeInstagramProfile(settings.igUsername, 30)

    // Calculate avg metrics from latest posts
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

    // Save snapshot
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

    // Upsert posts (insert new, ignore existing by ig_id)
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

    return Response.json({
      ok: true,
      followers: profile.followersCount,
      postsScraped: profile.latestPosts.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
