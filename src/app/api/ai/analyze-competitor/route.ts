import { auth } from "@/lib/auth"
import { analyzeCompetitor } from "@/lib/openai-client"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { handle, followers, engagementRate, postsPerWeek, growth30d } = await req.json()
  if (!handle) return new Response("handle required", { status: 400 })

  try {
    const analysis = await analyzeCompetitor({
      handle,
      followers: followers ?? 0,
      engagementRate: engagementRate ?? 0,
      postsPerWeek: postsPerWeek ?? 0,
      growth30d: growth30d ?? [],
    })
    return Response.json({ analysis })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
