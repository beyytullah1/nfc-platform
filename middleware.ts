import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Reserved paths that should NOT be treated as card slugs
const RESERVED_PATHS = [
    '/dashboard', '/api', '/login', '/register', '/logout', '/forgot-password',
    '/plant', '/mug', '/gift', '/c', '/card', '/t', '/p', '/page', '/u',
    '/admin', '/claim', '/actions', '/_next', '/favicon'
]

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Admin check moved to Layout to prevent Edge Runtime hangs
    // path rewriting logic below...

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
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)"
    ]
}
