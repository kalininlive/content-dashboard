/**
 * kie.ai Nano Banana 2 — image generation
 * Docs: https://docs.kie.ai/market/google/nanobanana2
 *
 * API is async (job-based):
 * 1. POST /api/v1/jobs/createTask → jobId
 * 2. GET  /api/v1/jobs/{jobId}   → poll until status=completed
 * 3. Result contains imageUrl
 */

import { db } from "@/db"
import { adminSettings } from "@/db/schema"
import { decrypt } from "./crypto"

const KIE_API = "https://api.kie.ai/api/v1"

async function getApiKey(): Promise<string> {
  const [settings] = await db.select().from(adminSettings).limit(1)
  if (!settings?.imageGenKeyEnc) {
    throw new Error("Kie.ai API key not configured. Add it in Admin Settings.")
  }
  return decrypt(settings.imageGenKeyEnc)
}

export type AspectRatio =
  | "1:1" | "4:5" | "9:16" | "16:9" | "3:4" | "4:3"
  | "2:3" | "3:2" | "1:2" | "2:1"

export interface GenerateImageOptions {
  prompt: string
  aspectRatio?: AspectRatio
  resolution?: "1K" | "2K" | "4K"
  outputFormat?: "JPG" | "PNG"
  /** Reference images (URLs), up to 14 */
  referenceImages?: string[]
}

interface KieTask {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  output?: { imageUrl?: string; images?: string[] }
  error?: string
}

/** Generate an image and return its URL. Polls until done (max 90s). */
export async function generateImage(opts: GenerateImageOptions): Promise<string> {
  const apiKey = await getApiKey()

  // Step 1: Create task
  const createRes = await fetch(`${KIE_API}/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nano-banana-2",
      input: {
        prompt: opts.prompt,
        aspect_ratio: opts.aspectRatio ?? "1:1",
        resolution: opts.resolution ?? "1K",
        output_format: opts.outputFormat ?? "JPG",
        ...(opts.referenceImages?.length
          ? { image_input: opts.referenceImages }
          : {}),
      },
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`kie.ai createTask error: ${err}`)
  }

  const created = await createRes.json()
  const jobId: string = created.id ?? created.jobId ?? created.task_id
  if (!jobId) throw new Error(`kie.ai: no jobId in response: ${JSON.stringify(created)}`)

  // Step 2: Poll for result (max 90s)
  const maxAttempts = 18 // 18 × 5s = 90s
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5_000))

    const pollRes = await fetch(`${KIE_API}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const task: KieTask = await pollRes.json()

    if (task.status === "completed") {
      const url =
        task.output?.imageUrl ??
        task.output?.images?.[0]
      if (!url) throw new Error("kie.ai: completed but no imageUrl")
      return url
    }

    if (task.status === "failed") {
      throw new Error(`kie.ai job failed: ${task.error ?? "unknown"}`)
    }
  }

  throw new Error("kie.ai: timeout waiting for image generation (90s)")
}
