import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) redirect("/auth/login")
    if (!session.user.username) redirect("/onboarding")

    console.log("session data :", session)

    return (
        <div>
            <LogoutButton />
        </div>
    )
}
