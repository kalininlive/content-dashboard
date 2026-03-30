import { auth } from "@/lib/auth"
import { generateCaption } from "@/lib/openai-client"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { topic, style = "informational", language = "ru", accountContext } = await req.json()
  if (!topic) return new Response("topic required", { status: 400 })

  try {
    const caption = await generateCaption({ topic, style, language, accountContext })
    return Response.json({ caption })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
