import { api } from "@/lib/api"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname === "/multiplayer/play") {
        return NextResponse.next()
    }

    const cookieHeader = request.headers.get("cookie") || ""

    const {
        data: { isPlaying },
    } = await api.get<{ isPlaying: boolean }>("/multiplayer/isPlaying", {
        headers: {
            cookie: cookieHeader,
        },
    })

    if (isPlaying) {
        console.log("PROXY: user is playing , redirecting to /multiplayer/play")
        return NextResponse.redirect(new URL("/multiplayer/play", request.url))
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
