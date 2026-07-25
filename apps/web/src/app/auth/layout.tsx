"use client"
import LoadingPage from "@/components/loading-page"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
    const { data: session, isPending } = authClient.useSession()
    const router = useRouter()

    useEffect(() => {
        if (!isPending && session) {
            router.replace("/profile")
        }
    }, [session, isPending, router])

    if (isPending) {
        return <LoadingPage />
    }

    if (session) return null

    return <>{children}</>
}
