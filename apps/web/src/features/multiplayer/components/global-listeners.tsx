"use client"
import { useGameStore } from "@/features/game/game-store"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { useRouter } from "next/navigation"

export default function GlobalListeners() {
    const gameState = useGameStore()
    const router = useRouter()

    useSocketListener("game_found", (game) => {
        console.log("game found: ", game)
        gameState.resetGame()
        gameState.setMode("multiplayer")
        gameState.setStatus(game.status)

        router.push(`/multiplayer/play`)
    })

    return null
}
