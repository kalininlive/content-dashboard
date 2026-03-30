import { auth } from "@/lib/auth"
import { db } from "@/db"
import { posts, igAccounts } from "@/db/schema"
import { decrypt } from "@/lib/crypto"
import {
  createMediaContainer,
  publishContainer,
  waitUntilReady,
} from "@/lib/meta"
import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { postId } = await req.json()
  if (!postId) return new Response("postId required", { status: 400 })

  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (!post) return new Response("Post not found", { status: 404 })

  const [account] = await db.select().from(igAccounts).limit(1)
  if (!account) return new Response("No Instagram account connected", { status: 400 })

  const accessToken = decrypt(account.accessTokenEnc)
  const igUserId = account.igUserId

  try {
    let igPostId: string

    if (post.postType === "carousel" && post.mediaUrls && post.mediaUrls.length > 1) {
      // Create carousel
      const childIds: string[] = []
      for (const imageUrl of post.mediaUrls) {
        const childId = await createMediaContainer({
          igUserId,
          accessToken,
          mediaType: "IMAGE",
          imageUrl,
          isCarouselItem: true,
        })
        childIds.push(childId)
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
        videoUrl: post.mediaUrls?.[0],
      })
      igPostId = await publishContainer(igUserId, containerId, accessToken)
    } else {
      // Single image post
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
      .set({
        status: "published",
        igPostId,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))

    return Response.json({ ok: true, igPostId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    await db
      .update(posts)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(posts.id, postId))
    return Response.json({ error: message }, { status: 500 })
  }
}

function buildCaption(caption?: string | null, hashtags?: string[] | null): string {
  const parts: string[] = []
  if (caption) parts.push(caption)
  if (hashtags?.length) parts.push(hashtags.join(" "))
  return parts.join("\n\n")
}
