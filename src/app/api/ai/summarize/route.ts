import { auth } from "@/lib/auth"
import { summarizeNews } from "@/lib/openai-client"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { title, content } = await req.json()
  if (!title) return new Response("title required", { status: 400 })

  try {
    const summary = await summarizeNews(title, content ?? "")
    return Response.json({ summary })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
