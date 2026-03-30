/**
 * Meta Graph API helpers for Instagram publishing.
 *
 * Flow for image post:
 *   1. createMediaContainer() → containerId
 *   2. publishContainer(containerId) → igPostId
 *
 * Flow for carousel:
 *   1. createMediaContainer() × N → [containerId1, ...] (children)
 *   2. createCarouselContainer([children]) → carouselId
 *   3. publishContainer(carouselId) → igPostId
 *
 * Flow for reel / story:
 *   1. createMediaContainer({ mediaType: "REELS"|"STORIES", videoUrl }) → containerId
 *   2. waitUntilReady(containerId) — async upload (poll status)
 *   3. publishContainer(containerId) → igPostId
 */

const GRAPH_URL = "https://graph.instagram.com/v21.0"

type MediaType = "IMAGE" | "VIDEO" | "REELS" | "STORIES" | "CAROUSEL_ALBUM"

interface CreateContainerOptions {
  igUserId: string
  accessToken: string
  mediaType?: MediaType
  imageUrl?: string
  videoUrl?: string
  caption?: string
  isCarouselItem?: boolean
  children?: string[] // carousel child container IDs
  locationId?: string
}

/** Create a media container (step 1). */
export async function createMediaContainer(opts: CreateContainerOptions): Promise<string> {
  const { igUserId, accessToken, mediaType = "IMAGE" } = opts

  const params = new URLSearchParams({ access_token: accessToken })

  if (mediaType === "CAROUSEL_ALBUM" && opts.children) {
    params.set("media_type", "CAROUSEL_ALBUM")
    params.set("children", opts.children.join(","))
    if (opts.caption) params.set("caption", opts.caption)
  } else if (mediaType === "IMAGE") {
    params.set("image_url", opts.imageUrl!)
    if (opts.caption) params.set("caption", opts.caption)
    if (opts.isCarouselItem) params.set("is_carousel_item", "true")
  } else {
    // VIDEO, REELS, STORIES
    params.set("media_type", mediaType)
    params.set("video_url", opts.videoUrl!)
    if (opts.caption && mediaType !== "STORIES") params.set("caption", opts.caption)
  }

  const res = await fetch(`${GRAPH_URL}/${igUserId}/media`, {
    method: "POST",
    body: params,
  })
  const data = await res.json()

  if (!res.ok || !data.id) {
    throw new Error(`Meta createContainer error: ${JSON.stringify(data)}`)
  }
  return data.id as string
}

/** Poll until video container is ready (status = FINISHED). Max 3 min. */
export async function waitUntilReady(containerId: string, accessToken: string): Promise<void> {
  const maxAttempts = 18 // 18 × 10s = 3 min
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_URL}/${containerId}?fields=status_code&access_token=${accessToken}`
    )
    const data = await res.json()

    if (data.status_code === "FINISHED") return
    if (data.status_code === "ERROR") {
      throw new Error(`Media container error: ${JSON.stringify(data)}`)
    }
    await new Promise((r) => setTimeout(r, 10_000))
  }
  throw new Error("Timeout waiting for media container to be ready")
}

/** Publish a ready container (step 2). Returns the Instagram post ID. */
export async function publishContainer(
  igUserId: string,
  containerId: string,
  accessToken: string
): Promise<string> {
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  })

  const res = await fetch(`${GRAPH_URL}/${igUserId}/media_publish`, {
    method: "POST",
    body: params,
  })
  const data = await res.json()

  if (!res.ok || !data.id) {
    throw new Error(`Meta publish error: ${JSON.stringify(data)}`)
  }
  return data.id as string
}

/** Refresh a long-lived token (valid for 60 days; refresh before expiry). */
export async function refreshLongLivedToken(accessToken: string): Promise<{
  accessToken: string
  expiresInSeconds: number
}> {
  const res = await fetch(
    `${GRAPH_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
  )
  const data = await res.json()

  if (!res.ok || !data.access_token) {
    throw new Error(`Meta token refresh error: ${JSON.stringify(data)}`)
  }
  return { accessToken: data.access_token, expiresInSeconds: data.expires_in }
}

/** Exchange a short-lived code (from OAuth callback) for a long-lived token. */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{
  accessToken: string
  tokenType: string
}> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  })

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: params,
  })
  const short = await res.json()
  if (!short.access_token) throw new Error(`Instagram OAuth error: ${JSON.stringify(short)}`)

  // Exchange short-lived for long-lived (60 days)
  const longRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&access_token=${short.access_token}`
  )
  const long = await longRes.json()
  if (!long.access_token) throw new Error(`Long-lived token error: ${JSON.stringify(long)}`)

  return { accessToken: long.access_token, tokenType: long.token_type }
}

/** Get basic profile info for a connected account. */
export async function getProfile(accessToken: string): Promise<{
  id: string
  username: string
  profilePictureUrl?: string
}> {
  const res = await fetch(
    `${GRAPH_URL}/me?fields=id,username,profile_picture_url&access_token=${accessToken}`
  )
  const data = await res.json()
  if (!data.id) throw new Error(`Meta getProfile error: ${JSON.stringify(data)}`)
  return {
    id: data.id,
    username: data.username,
    profilePictureUrl: data.profile_picture_url,
  }
}
