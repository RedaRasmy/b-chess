import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

export default async function Layout({ children }: { children: ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/auth/login")
    if (session.user.username) redirect("/profile")
    return children
}
