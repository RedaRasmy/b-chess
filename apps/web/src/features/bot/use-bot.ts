import { useBotStore } from "@/features/bot/store"
import { useGameStore } from "@/features/game/game-store"
import { useEffect, useRef } from "react"

/**
 * Initiate the engine then play when bot's turn
 */
export default function useBot() {
    const requestBotMove = useBotStore((s) => s.requestBotMove)
    const initEngine = useBotStore((s) => s.initEngine)
    const destroyEngine = useBotStore((s) => s.destroyEngine)
    const playerColor = useGameStore((s) => s.playerColor)
    const chess = useGameStore((s) => s.chess)
    const displayFen = useGameStore((s) => s.displayFen)
    const status = useGameStore((s) => s.status)
    const engineReady = useBotStore((s) => s.engineReady)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (status !== "playing" || !engineReady) return

        const turn = chess.turn() === "w" ? "white" : "black"
        const isBotTurn = turn !== playerColor

        if (isBotTurn) {
            timeoutRef.current = setTimeout(requestBotMove, 500)
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [displayFen, engineReady])

    useEffect(() => {
        initEngine()
        return () => destroyEngine()
    }, [])
}
