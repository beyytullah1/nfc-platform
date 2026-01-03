import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Reserved paths that should NOT be treated as card slugs
const RESERVED_PATHS = [
    '/dashboard', '/api', '/login', '/register', '/logout', '/forgot-password',
    '/plant', '/mug', '/gift', '/c', '/card', '/t', '/p', '/page',
    '/admin', '/claim', '/actions'
]

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    // Auth logic - Korumalı sayfalar
    const protectedPaths = ["/dashboard", "/cards", "/admin"]
    const isProtected = protectedPaths.some(path => pathname.startsWith(path))

    // Auth sayfaları (login, register)
    const authPaths = ["/login", "/register"]
    const isAuthPage = authPaths.some(path => pathname.startsWith(path))

    // Giriş yapmış kullanıcı auth sayfalarına erişmeye çalışırsa
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Giriş yapmamış kullanıcı korumalı sayfaya erişmeye çalışırsa
    if (!isLoggedIn && isProtected) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Username rewrite logic - /beytullah → /c/beytullah
    // Skip reserved paths
    const isReserved = RESERVED_PATHS.some(path => pathname.startsWith(path))

    if (!isReserved && pathname !== '/' && !pathname.includes('.')) {
        const username = pathname.slice(1).split('/')[0]

        // If looks like a card username (alphanumeric, hyphens, underscores)
        if (/^[a-z0-9_-]+$/i.test(username)) {
            const url = req.nextUrl.clone()
            url.pathname = `/c/${username}`
            return NextResponse.rewrite(url)
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
