import { api } from "@/lib/api"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const EXCLUDED_PREFIXES = ["/auth", "/api", "/multiplayer/play", "/_next"]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.next()
    }

    const cookieHeader = request.headers.get("cookie") || ""

    try {
        const {
            data: { isPlaying },
        } = await api.get<{ isPlaying: boolean }>("/multiplayer/isPlaying", {
            headers: { cookie: cookieHeader },
        })

        if (isPlaying) {
            return NextResponse.redirect(
                new URL("/multiplayer/play", request.url),
            )
        }
    } catch (err) {
        console.error("PROXY: isPlaying check failed", err)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
