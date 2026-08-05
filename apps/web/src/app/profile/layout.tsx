import LoadingPage from "@/components/loading-page"
import UserProvider from "@/features/profile/components/user-provider"
import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
    return <UserProvider fallback={<LoadingPage />}>{children}</UserProvider>
}
