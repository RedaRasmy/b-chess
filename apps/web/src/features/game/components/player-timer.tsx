import { useGameStore } from "@/features/game/game-store"
import { useEffect, useState } from "react"

export function PlayerTimer({ color }: { color: "white" | "black" }) {
    const clock = useGameStore((s) => s.clock)
    if (!clock) throw new Error("PlayerTimer can't be used while clock is null")

    const status = useGameStore((s) => s.status)
    const endGame = useGameStore((s) => s.endGame)
    const [ms, setMs] = useState(clock[color])

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
                endGame(color === "white" ? "black" : "white", "timeout")
            }
        }, 100)

        return () => clearInterval(interval)
    }, [clock, status, color])

    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const tenths = Math.floor((ms % 1000) / 100)

    const display =
        ms < 10000
            ? `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`
            : `${minutes}:${String(seconds).padStart(2, "0")}`

    return (
        <span className={ms < 10000 ? "text-red-500" : "" + "px-2"}>
            {display}
        </span>
    )
}
