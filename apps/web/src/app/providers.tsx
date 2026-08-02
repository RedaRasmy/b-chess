"use client"
import SocketProvider from "@/features/multiplayer/components/socket-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <SocketProvider>{children}</SocketProvider>
        </QueryClientProvider>
    )
}
