"use client"
import { useSocket } from "@/features/multiplayer/hooks/use-socket"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
    // const params = useParams()
    // const gameId = params.gameId as string
    const socket = useSocket()

    useEffect(() => {
        socket.emit("join_game")
    }, [])

    useSocketListener("current_state", (game) => {
        console.log("sync/ current state : ", game)
    })

    return <div>game page</div>
}
