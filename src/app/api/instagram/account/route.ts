import { auth } from "@/lib/auth"
import { db } from "@/db"
import { igAccounts } from "@/db/schema"

export async function GET() {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const [account] = await db.select().from(igAccounts).limit(1)
  if (!account) return Response.json({ connected: false })

  return Response.json({
    connected: true,
    igUsername: account.igUsername,
    profilePicUrl: account.profilePicUrl,
    tokenExpiry: account.tokenExpiry,
  })
}

export async function DELETE() {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  await db.delete(igAccounts)
  return Response.json({ ok: true })
}
