import { auth } from "@/lib/auth"
import { generateHashtags } from "@/lib/openai-client"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { caption, language = "ru" } = await req.json()
  if (!caption) return new Response("caption required", { status: 400 })

  try {
    const hashtags = await generateHashtags(caption, language)
    return Response.json({ hashtags })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
