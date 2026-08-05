'use client'
import useStats from "@/features/profile/hooks/use-stats"
import { UserContext, UserWithUsername } from "@/features/profile/user-context"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

export default function UserProvider({
    children,
    fallback = null,
}: {
    children: ReactNode
    fallback?: ReactNode
}) {
    const { data: session, isPending } = authClient.useSession()

    const router = useRouter()

    useEffect(() => {
        if (!isPending && !session) {
            router.replace("/auth/login")
        }
        if (session && !session.user.username) {
            router.replace("/onboarding")
        }
    }, [isPending, session, router])

    const { data: stats, isPending: isStatsPending } = useStats()

    if (isPending || isStatsPending) return fallback

    if (!session || !session.user.username || !stats) return null

    return (
        <UserContext.Provider
            value={{
                user: session.user as UserWithUsername,
                stats,
                session: session.session,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
