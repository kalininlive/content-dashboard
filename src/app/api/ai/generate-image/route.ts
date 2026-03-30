import { auth } from "@/lib/auth"
import { generateImage, type AspectRatio } from "@/lib/image-gen"
import { put } from "@vercel/blob"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const {
    prompt,
    aspectRatio = "1:1",
    resolution = "1K",
  }: { prompt: string; aspectRatio?: AspectRatio; resolution?: "1K" | "2K" | "4K" } =
    await req.json()

  if (!prompt) return new Response("prompt required", { status: 400 })

  try {
    // Generate via kie.ai
    const imageUrl = await generateImage({ prompt, aspectRatio, resolution })

    // Download and re-host on Vercel Blob for permanent storage
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) throw new Error("Failed to fetch generated image")
    const blob = await imgRes.blob()

    const stored = await put(
      `ai-generated/${Date.now()}.jpg`,
      blob,
      { access: "public", contentType: "image/jpeg" }
    )

    return Response.json({ url: stored.url, originalUrl: imageUrl })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
