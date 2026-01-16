import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Reserved paths that should NOT be treated as usernames/card slugs
const RESERVED_PATHS = [
  "/dashboard",
  "/api",
  "/login",
  "/register",
  "/logout",
  "/forgot-password",
  "/reset-password",
  "/complete-profile",
  "/plant",
  "/mug",
  "/gift",
  "/c",
  "/card",
  "/t",
  "/p",
  "/page",
  "/u",
  "/h",
  "/admin",
  "/claim",
  "/actions",
  "/_next",
  "/favicon",
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // IMPORTANT:
  // Middleware runs on Edge runtime. Do NOT call auth(), Prisma, DB, etc. here.

  // Redirect /u/[code] -> /t/[code] for NFC codes
  if (pathname.startsWith("/u/") && pathname.length > 3) {
    const code = pathname.slice(3)
    if (/^[A-Z0-9]+$/.test(code)) {
      const url = req.nextUrl.clone()
      url.pathname = `/t/${code}`
      return NextResponse.redirect(url)
    }
  }

  // Username rewrite logic - /beytullah -> /c/beytullah
  const isReserved = RESERVED_PATHS.some((p) => pathname.startsWith(p))

  if (!isReserved && pathname !== "/" && !pathname.includes(".")) {
    const username = pathname.slice(1).split("/")[0]
    if (/^[a-z0-9_-]+$/i.test(username)) {
      const url = req.nextUrl.clone()
      url.pathname = `/c/${username}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
