import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth(function proxy(req) {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === "/login"
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  // Redirect unauthenticated users to /login
  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect authenticated users away from /login
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
