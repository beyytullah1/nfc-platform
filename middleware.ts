import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    // Korumalı sayfalar
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

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
