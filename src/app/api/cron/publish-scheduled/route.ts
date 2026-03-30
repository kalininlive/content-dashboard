import { db } from "@/db"
import { posts, igAccounts } from "@/db/schema"
import { decrypt } from "@/lib/crypto"
import {
  createMediaContainer,
  publishContainer,
  waitUntilReady,
} from "@/lib/meta"
import { and, eq, lte } from "drizzle-orm"
import { NextRequest } from "next/server"

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // not configured — allow (dev mode)
  const auth = req.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

function buildCaption(caption?: string | null, hashtags?: string[] | null): string {
  const parts: string[] = []
  if (caption) parts.push(caption)
  if (hashtags?.length) parts.push(hashtags.join(" "))
  return parts.join("\n\n")
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) return new Response("Unauthorized", { status: 401 })

  const now = new Date()

  const scheduled = await db
    .select()
    .from(posts)
    .where(and(eq(posts.status, "scheduled"), lte(posts.publishDate, now)))
    .limit(10)

  if (scheduled.length === 0) {
    return Response.json({ ok: true, published: 0 })
  }

  const [account] = await db.select().from(igAccounts).limit(1)
  if (!account) {
    return Response.json({ error: "No Instagram account connected" }, { status: 400 })
  }

  const accessToken = decrypt(account.accessTokenEnc)
  const igUserId = account.igUserId

  let published = 0

  for (const post of scheduled) {
    try {
      let igPostId: string

      if (post.postType === "carousel" && post.mediaUrls && post.mediaUrls.length > 1) {
        const childIds: string[] = []
        for (const imageUrl of post.mediaUrls) {
          const id = await createMediaContainer({
            igUserId,
            accessToken,
            mediaType: "IMAGE",
            imageUrl,
            isCarouselItem: true,
          })
          childIds.push(id)
        }
        const carouselId = await createMediaContainer({
          igUserId,
          accessToken,
          mediaType: "CAROUSEL_ALBUM",
          children: childIds,
          caption: buildCaption(post.caption, post.hashtags),
        })
        igPostId = await publishContainer(igUserId, carouselId, accessToken)
      } else if (post.postType === "reel") {
        const containerId = await createMediaContainer({
          igUserId,
          accessToken,
          mediaType: "REELS",
          videoUrl: post.mediaUrls?.[0],
          caption: buildCaption(post.caption, post.hashtags),
        })
        await waitUntilReady(containerId, accessToken)
        igPostId = await publishContainer(igUserId, containerId, accessToken)
      } else if (post.postType === "story") {
        const containerId = await createMediaContainer({
          igUserId,
          accessToken,
          mediaType: "STORIES",
          imageUrl: post.mediaUrls?.[0],
        })
        igPostId = await publishContainer(igUserId, containerId, accessToken)
      } else {
        const containerId = await createMediaContainer({
          igUserId,
          accessToken,
          mediaType: "IMAGE",
          imageUrl: post.mediaUrls?.[0],
          caption: buildCaption(post.caption, post.hashtags),
        })
        igPostId = await publishContainer(igUserId, containerId, accessToken)
      }

      await db
        .update(posts)
        .set({ status: "published", igPostId, errorMessage: null, updatedAt: now })
        .where(eq(posts.id, post.id))

      published++
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown"
      await db
        .update(posts)
        .set({ status: "failed", errorMessage: message, updatedAt: now })
        .where(eq(posts.id, post.id))
    }
  }

  return Response.json({ ok: true, published })
}
