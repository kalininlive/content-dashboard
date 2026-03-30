import { ApifyClient } from "apify-client"
import { db } from "@/db"
import { adminSettings } from "@/db/schema"
import { decrypt } from "./crypto"

const INSTAGRAM_SCRAPER_ACTOR = "apify/instagram-scraper"

async function getClient(): Promise<ApifyClient> {
  const [settings] = await db.select().from(adminSettings).limit(1)
  if (!settings?.apifyKeyEnc) {
    throw new Error("Apify API key not configured. Add it in Admin Settings.")
  }
  const token = decrypt(settings.apifyKeyEnc)
  return new ApifyClient({ token })
}

export interface IgProfileData {
  username: string
  fullName: string
  biography: string
  followersCount: number
  followsCount: number
  postsCount: number
  profilePicUrl: string
  latestPosts: IgPostData[]
}

export interface IgPostData {
  id: string
  shortCode: string
  caption: string
  mediaUrl: string
  likesCount: number
  commentsCount: number
  timestamp: string
  type: string // Image | Video | Sidecar
}

/** Scrape an Instagram profile and its recent posts using Apify. */
export async function scrapeInstagramProfile(
  username: string,
  resultsLimit = 20
): Promise<IgProfileData> {
  const client = await getClient()

  const run = await client.actor(INSTAGRAM_SCRAPER_ACTOR).call({
    usernames: [username],
    resultsLimit,
    addParentData: false,
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  if (!items.length) {
    throw new Error(`No data returned for @${username}`)
  }

  const profile = items[0] as Record<string, unknown>

  const latestPosts: IgPostData[] = ((profile.latestPosts as unknown[]) ?? []).map(
    (p: unknown) => {
      const post = p as Record<string, unknown>
      return {
        id: String(post.id ?? ""),
        shortCode: String(post.shortCode ?? ""),
        caption: String(post.caption ?? ""),
        mediaUrl: String(post.displayUrl ?? post.videoUrl ?? ""),
        likesCount: Number(post.likesCount ?? 0),
        commentsCount: Number(post.commentsCount ?? 0),
        timestamp: String(post.timestamp ?? ""),
        type: String(post.type ?? "Image"),
      }
    }
  )

  return {
    username: String(profile.username ?? username),
    fullName: String(profile.fullName ?? ""),
    biography: String(profile.biography ?? ""),
    followersCount: Number(profile.followersCount ?? 0),
    followsCount: Number(profile.followsCount ?? 0),
    postsCount: Number(profile.postsCount ?? 0),
    profilePicUrl: String(profile.profilePicUrl ?? ""),
    latestPosts,
  }
}
