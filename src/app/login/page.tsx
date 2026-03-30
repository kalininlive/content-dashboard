"use client"

import { useState, useTransition } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверный email или пароль")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.65 0.26 285 / 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{
              background: "oklch(0.65 0.26 285 / 0.15)",
              boxShadow: "0 0 24px oklch(0.65 0.26 285 / 0.3)",
              border: "1px solid oklch(0.65 0.26 285 / 0.3)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">InstaDashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Войдите в панель управления</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "oklch(0.14 0.020 265)",
            border: "1px solid oklch(1 0 0 / 8%)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@kalininlive.ru"
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isPending
                  ? "oklch(0.65 0.26 285 / 0.6)"
                  : "oklch(0.65 0.26 285)",
                boxShadow: isPending ? "none" : "0 0 20px oklch(0.65 0.26 285 / 0.4)",
              }}
            >
              {isPending ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
