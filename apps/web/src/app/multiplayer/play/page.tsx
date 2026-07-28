"use client"
import { useSocket } from "@/features/multiplayer/hooks/use-socket"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function Page() {
    const socket = useSocket()
    const router = useRouter()

    useEffect(() => {
        socket.emit("join_game")
    }, [])

    useSocketListener("current_state", (game) => {
        console.log("sync/ current state : ", game)
    })

    useSocketListener("exception", ({ message }) => {
        console.log("exception: ", message)
        toast.error("Game Not Found!", {
            richColors: true,
        })
        router.replace("/multiplayer")
    })

    return <div>game page</div>
}
