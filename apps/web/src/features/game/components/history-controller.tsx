import { useGameStore } from "@/features/game/game-store"
import {
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
} from "lucide-react"

export default function HistoryController() {
    const undo = useGameStore((s) => s.stepBack)
    const redo = useGameStore((s) => s.stepForward)
    const gotoStart = useGameStore((s) => s.goToStart)
    const gotoEnd = useGameStore((s) => s.goToEnd)
    const viewIndex = useGameStore((s) => s.viewIndex)

    const isAtStart = viewIndex === -1
    const isAtEnd = viewIndex === null

    return (
        <div className="grid grid-cols-4 w-full bg-accent/50 ">
            <button
                disabled={isAtStart}
                onClick={gotoStart}
                className="w-full cursor-pointer hover:bg-accent stroke-white/50 hover:stroke-white py-1"
            >
                <ChevronsLeft className="size-9 stroke-inherit font-bold mx-auto" />
            </button>
            <button
                disabled={isAtStart}
                onClick={undo}
                className="w-full cursor-pointer hover:bg-accent stroke-white/50 hover:stroke-white"
            >
                <ChevronLeft className="size-9 stroke-inherit font-bold mx-auto" />
            </button>
            <button
                disabled={isAtEnd}
                onClick={redo}
                className="w-full cursor-pointer hover:bg-accent stroke-white/50 hover:stroke-white"
            >
                <ChevronRight className="size-9 stroke-inherit font-bold mx-auto" />
            </button>
            <button
                disabled={isAtEnd}
                onClick={gotoEnd}
                className="w-full cursor-pointer hover:bg-accent stroke-white/50 hover:stroke-white"
            >
                <ChevronsRight className="size-9 stroke-inherit font-bold mx-auto" />
            </button>
        </div>
    )
}
