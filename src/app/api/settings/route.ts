import { auth } from "@/lib/auth"
import { db } from "@/db"
import { adminSettings } from "@/db/schema"
import { encrypt, decrypt } from "@/lib/crypto"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

// GET /api/settings — return current settings (keys masked)
export async function GET() {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const [settings] = await db.select().from(adminSettings).limit(1)
  if (!settings) return Response.json({})

  return Response.json({
    email: settings.email,
    hasOpenaiKey: !!settings.openaiKeyEnc,
    hasApifyKey: !!settings.apifyKeyEnc,
    hasImageGenKey: !!settings.imageGenKeyEnc,
    igUsername: settings.igUsername,
    autopilotConfig: settings.autopilotConfig,
  })
}

// PATCH /api/settings — update settings
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const body = await req.json()
  const [settings] = await db.select().from(adminSettings).limit(1)
  if (!settings) return new Response("Settings not found", { status: 404 })

  const updates: Partial<typeof adminSettings.$inferInsert> = {}

  // Change email
  if (body.email && body.email !== settings.email) {
    if (!body.currentPassword) return new Response("Current password required", { status: 400 })
    const valid = await bcrypt.compare(body.currentPassword, settings.passwordHash)
    if (!valid) return new Response("Incorrect password", { status: 403 })
    updates.email = body.email
  }

  // Change password
  if (body.newPassword) {
    if (!body.currentPassword) return new Response("Current password required", { status: 400 })
    const valid = await bcrypt.compare(body.currentPassword, settings.passwordHash)
    if (!valid) return new Response("Incorrect password", { status: 403 })
    if (body.newPassword.length < 8) return new Response("Password too short", { status: 400 })
    updates.passwordHash = await bcrypt.hash(body.newPassword, 12)
  }

  // API keys (encrypt before storing)
  if (body.openaiKey !== undefined) {
    updates.openaiKeyEnc = body.openaiKey ? encrypt(body.openaiKey) : null
  }
  if (body.apifyKey !== undefined) {
    updates.apifyKeyEnc = body.apifyKey ? encrypt(body.apifyKey) : null
  }
  if (body.imageGenKey !== undefined) {
    updates.imageGenKeyEnc = body.imageGenKey ? encrypt(body.imageGenKey) : null
  }

  // Instagram username (for Apify tracking)
  if (body.igUsername !== undefined) {
    updates.igUsername = body.igUsername || null
  }

  // Auto-pilot config
  if (body.autopilotConfig !== undefined) {
    updates.autopilotConfig = body.autopilotConfig
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date()
    await db.update(adminSettings).set(updates).where(eq(adminSettings.id, settings.id))
  }

  return Response.json({ ok: true })
}
