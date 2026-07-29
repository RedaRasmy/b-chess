import { useGameStore } from "@/features/game/game-store"
import { playSound } from "@/lib/sounds"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

export function PlayerTimer({ color }: { color: "white" | "black" }) {
    const clock = useGameStore((s) => s.clock)
    const playerColor = useGameStore((s) => s.playerColor)
    if (!clock || !playerColor)
        throw new Error(
            "PlayerTimer can't be used while clock or playerColor is null",
        )

    const status = useGameStore((s) => s.status)
    const endGame = useGameStore((s) => s.endGame)
    const [ms, setMs] = useState(clock[color])
    const isPlayer = playerColor === color
    const alertedRef = useRef(false)

    useEffect(() => {
        if (status !== "playing" || clock.activeColor !== color) {
            setMs(clock[color])
            return
        }

        const interval = setInterval(() => {
            const elapsed = Date.now() - (clock.lastTickAt ?? Date.now())
            const remaining = Math.max(0, clock[color] - elapsed)
            setMs(remaining)
            if (remaining === 0) {
                endGame(
                    color === "white" ? "black_won" : "white_won",
                    "Timeout",
                )
            }
            if (isPlayer && remaining <= 10000 && !alertedRef.current) {
                alertedRef.current = true
                playSound("timeoutAlert")
            }
        }, 100)

        return () => {
            clearInterval(interval)
            alertedRef.current = false
        }
    }, [clock, status, color])

    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const tenths = Math.floor((ms % 1000) / 100)

    const display =
        ms < 10000
            ? `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`
            : `${minutes}:${String(seconds).padStart(2, "0")}`

    return (
        <span
            className={cn("px-2", {
                "text-red-500": ms <= 10000,
            })}
        >
            {display}
        </span>
    )
}
