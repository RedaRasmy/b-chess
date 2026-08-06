"use client"
import { useGameStore } from "@/features/game/game-store"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { authClient } from "@/lib/auth-client"
import { getColor } from "@bchess/shared"
import { useRouter } from "next/navigation"

export default function GlobalListeners() {
    const gameState = useGameStore()
    const router = useRouter()
    const { data: session } = authClient.useSession()

    useSocketListener("game_found", (game) => {
        console.log("game found: ", game)
        gameState.resetGame()
        gameState.setMode("multiplayer")
        gameState.setStatus(game.status)

        router.push(`/multiplayer/play`)
    })

    useSocketListener("player_status_changed", ({ status, color }) => {
        gameState.setPlayerStatus(color, status)
    })

    useSocketListener("sync", (game) => {
        console.log("sync/ full game: ", game)
        const userId = session?.user.id

        if (userId) {
            const playerColor = game.whiteId === userId ? "white" : "black"

            gameState.syncGame(game, playerColor)
        } else {
            // TODO: create UserProvider
            console.warn("Sync Failed: User session is required to sync game")
        }
    })

    useSocketListener("game_finished", (game) => {
        console.log("game finished: ", game.result, game.reason, game.diff)

        gameState.endGame({
            result: game.result,
            reason: game.reason,
            elo: {
                whiteEloDiff: game.whiteDiff,
                blackEloDiff: game.blackDiff,
            },
        })
    })

    useSocketListener("new_move", (move) => {
        console.log("new move: ", move)
        if (!gameState.players) {
            throw new Error("Game is not initialized")
        }
        const isOwnMove =
            getColor(gameState.players.playerColor) === move.playerColor

        if (isOwnMove) return

        gameState.makeMove({
            from: move.from,
            to: move.to,
            promotion: move.promotion ?? undefined,
        })
    })

    return null
}
