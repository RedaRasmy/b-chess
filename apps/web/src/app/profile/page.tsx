"use client"
import LoadingPage from "@/components/loading-page"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
    const { isPending, data: session } = authClient.useSession()

    const router = useRouter()

    useEffect(() => {
        if (!isPending && !session) {
            router.replace("/auth/login")
        }
        if (session && !session.user.username) {
            router.replace("/onboarding")
        }
    }, [isPending, session, router])

    if (isPending) return <LoadingPage />

    if (!session) return null

    console.log("session data :", session)

    return (
        <div>
            <LogoutButton />
        </div>
    )
}
