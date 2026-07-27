"use client"
import LoadingPage from "@/components/loading-page"
import SocketProvider from "@/features/multiplayer/components/socket-provider"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

export default function Layout({ children }: { children: ReactNode }) {
    const { data: session, isPending } = authClient.useSession()
    const router = useRouter()

    useEffect(() => {
        if (!isPending && !session) {
            router.replace("/auth/login")
        }
    }, [session, isPending, router])

    if (isPending) {
        return <LoadingPage />
    }

    if (!session) return null

    return <SocketProvider>{children}</SocketProvider>
}
