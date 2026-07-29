"use client"
import GameBoard from "@/features/game/components/game-board"
import PlayerInfo from "@/features/game/components/player-info"
import { useGameStore } from "@/features/game/game-store"
import { getColor } from "@/features/game/utils/get-color"
import MultiplayerEndDialog from "@/features/multiplayer/components/multiplayer-end-dialog"
import MultiplayerControls from "@/features/multiplayer/components/mutiplayer-controls"
import { useSocket } from "@/features/multiplayer/hooks/use-socket"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { authClient } from "@/lib/auth-client"
import { parseTimerOption } from "@bchess/shared"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function Page() {
    const socket = useSocket()
    const router = useRouter()
    const gameState = useGameStore()
    const { data: session } = authClient.useSession()
    if (!session) throw new Error("multiplayer/page: unauthorized")

    const userId = session.user.id

    useEffect(() => {
        socket.emit("join_game")
    }, [])

    useEffect(() => {
        const unsubscribe = useGameStore.subscribe(
            (state) => state.lastAction,
            (lastAction) => {
                if (!lastAction) return

                if (lastAction.type === "timeout") {
                    socket.emit("timeout")
                }

                if (lastAction.type === "move") {
                    // TODO
                }
            },
        )

        return () => unsubscribe()
    }, [socket])

    useSocketListener("current_state", (game) => {
        console.log("sync/ current state : ", game)

        gameState.setMode("multiplayer")

        const playerColor = game.whiteId === userId ? "white" : "black"

        if (game.status === "playing") {
            const { base, plus } = parseTimerOption(game.timer)
            gameState.startClock({
                initial: base * 1000,
                increment: plus * 1000,
                lastTickAt: game.gameStartedAt,
            })
        }

        gameState.setPlayerColor(playerColor)
        gameState.setPosition(game.currentFen)

        gameState.setStatus(game.status)

        gameState.setPlayers(
            {
                id: game.whiteId,
                username: game.white.username,
            },
            {
                id: game.blackId,
                username: game.black.username,
            },
        )

        if (game.status === "finished") {
            gameState.endGame(game.result, game.gameOverReason)
        }
    })

    useSocketListener("exception", ({ message }) => {
        console.log("exception: ", message)
        toast.error("Game Not Found!", {
            richColors: true,
        })
        router.replace("/multiplayer")
    })

    const playerColor = gameState.playerColor

    const opponentColor =
        playerColor === null ? null : playerColor === "white" ? "b" : "w"
    const color = playerColor === null ? null : getColor(playerColor)

    return (
        <div className="flex flex-wrap w-full h-full gap-3 lg:gap-5 xl:gap-8">
            <MultiplayerEndDialog />
            <div className="flex-auto flex justify-center items-center">
                <div className="flex flex-col w-full max-w-[75vh] gap-2 px-1">
                    <PlayerInfo color={opponentColor} />
                    <GameBoard />
                    <PlayerInfo color={color} />
                </div>
            </div>
            <MultiplayerControls />
        </div>
    )
}
