import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const appId = process.env.META_APP_ID
  const redirectUri = process.env.META_REDIRECT_URI

  if (!appId || !redirectUri) {
    return new Response("META_APP_ID or META_REDIRECT_URI not configured", { status: 500 })
  }

  const scope = [
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_insights",
    "pages_show_list",
    "pages_read_engagement",
  ].join(",")

  const authUrl =
    `https://www.facebook.com/v21.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}` +
    `&response_type=code`

  return Response.redirect(authUrl)
}
