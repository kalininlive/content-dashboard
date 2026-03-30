import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/db"
import { adminSettings } from "@/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        // Check DB first
        try {
          const [admin] = await db
            .select()
            .from(adminSettings)
            .where(eq(adminSettings.email, email))
            .limit(1)

          if (admin) {
            const valid = await bcrypt.compare(password, admin.passwordHash)
            if (!valid) return null
            return { id: admin.id, email: admin.email, name: "Admin" }
          }
        } catch {
          // DB not available — fall through to env fallback
        }

        // Env fallback (before first seed)
        const envEmail = process.env.ADMIN_EMAIL
        const envPassword = process.env.ADMIN_PASSWORD
        if (email === envEmail && password === envPassword) {
          return { id: "env-admin", email, name: "Admin" }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
})
