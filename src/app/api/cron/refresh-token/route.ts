import { db } from "@/db"
import { igAccounts } from "@/db/schema"
import { decrypt, encrypt } from "@/lib/crypto"
import { refreshLongLivedToken } from "@/lib/meta"
import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) return new Response("Unauthorized", { status: 401 })

  const accounts = await db.select().from(igAccounts)

  for (const account of accounts) {
    // Refresh if expiry is within 15 days
    const daysUntilExpiry = account.tokenExpiry
      ? (account.tokenExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      : 0

    if (daysUntilExpiry > 15) continue

    try {
      const currentToken = decrypt(account.accessTokenEnc)
      const { accessToken, expiresInSeconds } = await refreshLongLivedToken(currentToken)

      await db
        .update(igAccounts)
        .set({
          accessTokenEnc: encrypt(accessToken),
          tokenExpiry: new Date(Date.now() + expiresInSeconds * 1000),
          updatedAt: new Date(),
        })
        .where(eq(igAccounts.id, account.id))
    } catch (err) {
      console.error(`Token refresh failed for ${account.igUsername}:`, err)
    }
  }

  return Response.json({ ok: true })
}
