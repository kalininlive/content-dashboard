import type { Config } from "drizzle-kit"
import { config } from "dotenv"

config({ path: ".env.local" })

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config
