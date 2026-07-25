"use client"
import LoadingPage from "@/components/loading-page"
import ProfileHeader from "@/features/profile/components/profile-header"
import { fetchStats } from "@/features/profile/requests"
import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
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

    const { data: stats, isPending: isStatsPending } = useQuery({
        queryKey: ["stats"],
        queryFn: fetchStats,
    })

    if (isPending || isStatsPending) return <LoadingPage />

    if (!session || !session.user.username || !stats) return null

    console.log("session data :", session)

    return (
        <div className="flex flex-col items-center h-full">
            <ProfileHeader username={session.user.username} stats={stats} />
        </div>
    )
}
