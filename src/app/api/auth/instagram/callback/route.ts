import { auth } from "@/lib/auth"
import { db } from "@/db"
import { igAccounts } from "@/db/schema"
import { encrypt } from "@/lib/crypto"
import { exchangeCodeForToken, getProfile } from "@/lib/meta"
import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return Response.redirect(new URL("/login", req.url))

  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return Response.redirect(
      new URL(`/dashboard/settings?tab=instagram&error=${error ?? "no_code"}`, req.url)
    )
  }

  try {
    const redirectUri = process.env.META_REDIRECT_URI!
    const { accessToken } = await exchangeCodeForToken(code, redirectUri)
    const profile = await getProfile(accessToken)

    // Upsert instagram account (only one account supported)
    const existing = await db
      .select()
      .from(igAccounts)
      .where(eq(igAccounts.igUserId, profile.id))
      .limit(1)

    const tokenExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days

    if (existing.length > 0) {
      await db
        .update(igAccounts)
        .set({
          igUsername: profile.username,
          accessTokenEnc: encrypt(accessToken),
          tokenExpiry,
          profilePicUrl: profile.profilePictureUrl,
          updatedAt: new Date(),
        })
        .where(eq(igAccounts.igUserId, profile.id))
    } else {
      await db.insert(igAccounts).values({
        igUserId: profile.id,
        igUsername: profile.username,
        accessTokenEnc: encrypt(accessToken),
        tokenExpiry,
        profilePicUrl: profile.profilePictureUrl,
      })
    }

    return Response.redirect(
      new URL("/dashboard/settings?tab=instagram&connected=true", req.url)
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown"
    return Response.redirect(
      new URL(`/dashboard/settings?tab=instagram&error=${encodeURIComponent(message)}`, req.url)
    )
  }
}
