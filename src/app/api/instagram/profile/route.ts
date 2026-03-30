import { auth } from "@/lib/auth"
import { db } from "@/db"
import { igSnapshots } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const [latest] = await db
    .select()
    .from(igSnapshots)
    .orderBy(desc(igSnapshots.scrapedAt))
    .limit(1)

  // Return the last 30 snapshots for growth chart
  const history = await db
    .select()
    .from(igSnapshots)
    .orderBy(desc(igSnapshots.scrapedAt))
    .limit(30)

  return Response.json({ latest: latest ?? null, history: history.reverse() })
}
