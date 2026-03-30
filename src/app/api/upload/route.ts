import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"
import { NextRequest } from "next/server"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
]

const MAX_SIZE = 100 * 1024 * 1024 // 100 MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return new Response("No file provided", { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(`Unsupported file type: ${file.type}`, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return new Response("File too large (max 100 MB)", { status: 400 })
  }

  const blob = await put(file.name, file, {
    access: "public",
    contentType: file.type,
  })

  return Response.json({ url: blob.url, contentType: blob.contentType })
}
