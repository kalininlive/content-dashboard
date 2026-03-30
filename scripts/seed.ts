/**
 * Seed script — creates the initial admin user.
 * Run once after first deployment: npm run seed
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment.
 * Idempotent: skips if record already exists.
 */
import "dotenv/config"
import { sql } from "@vercel/postgres"
import { drizzle } from "drizzle-orm/vercel-postgres"
import bcrypt from "bcryptjs"
import * as schema from "../src/db/schema"
import { eq } from "drizzle-orm"

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local")
    process.exit(1)
  }

  const db = drizzle(sql, { schema })

  const existing = await db
    .select()
    .from(schema.adminSettings)
    .where(eq(schema.adminSettings.email, email))
    .limit(1)

  if (existing.length > 0) {
    console.log(`Admin already exists: ${email}`)
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.insert(schema.adminSettings).values({
    email,
    passwordHash,
  })

  console.log(`✓ Admin created: ${email}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
