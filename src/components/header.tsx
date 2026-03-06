import { auth } from "@/lib/auth"
import { Button } from "./ui/button"
import { SidebarTrigger } from "./ui/sidebar"
import Link from "next/link"
import { headers } from "next/headers"

export default async function Header() {
    const session = await auth.api.getSession({ headers: await headers() })

    return (
        <div className="min-h-10 flex items-center pl-2 pr-4 justify-between sticky py-3">
            <SidebarTrigger />
            <div className="flex gap-2 md:gap-4">
                {!session && (
                    <Button asChild>
                        <Link href={"/auth/login"}>Sign in</Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
