"use client"
import LoadingPage from "@/components/loading-page"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"
import { toast } from "sonner"

export default function Layout({ children }: { children: ReactNode }) {
    const { data: session, isPending } = authClient.useSession()
    const router = useRouter()

    useEffect(() => {
        if (!isPending && !session) {
            toast.error("Sign-in to use multiplayer feature!", {
                richColors: true,
            })
            router.replace("/auth/login")
        }

        if (!isPending && session && !session.user.username) {
            router.replace("/onboarding")
        }
    }, [session, isPending, router])

    if (isPending) {
        return <LoadingPage />
    }

    if (!session || !session.user.username) return null

    return children
}
