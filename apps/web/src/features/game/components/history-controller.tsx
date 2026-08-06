import { useGameStore } from "@/features/game/game-store"
import {
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
} from "lucide-react"
import { useHotkeys } from "react-hotkeys-hook"

export default function HistoryController() {
    const stepBack = useGameStore((s) => s.stepBack)
    const stepForward = useGameStore((s) => s.stepForward)
    const gotoStart = useGameStore((s) => s.goToStart)
    const gotoEnd = useGameStore((s) => s.goToEnd)

    useHotkeys(["ctrl+z", "meta+z"], stepBack)
    useHotkeys(["ctrl+shift+z", "meta+shift+z"], stepForward)

    return (
        <div className="grid grid-cols-4 w-full bg-accent/50 ">
            <button
                onClick={gotoStart}
                className="w-full cursor-pointer hover:bg-accent stroke-white/50 hover:stroke-white py-1"
            >
                <ChevronsLeft className="size-9 stroke-inherit font-bold mx-auto" />
            </button>
            <button
                onClick={stepBack}
                className="w-full cursor-pointer hover:bg-accent stroke-white/50 hover:stroke-white"
            >
                <ChevronLeft className="size-9 stroke-inherit font-bold mx-auto" />
            </button>
            <button
                onClick={stepForward}
                className="w-full cursor-pointer hover:bg-accent stroke-white/50 hover:stroke-white"
            >
                <ChevronRight className="size-9 stroke-inherit font-bold mx-auto" />
            </button>
            <button
                onClick={gotoEnd}
                className="w-full cursor-pointer hover:bg-accent stroke-white/50 hover:stroke-white"
            >
                <ChevronsRight className="size-9 stroke-inherit font-bold mx-auto" />
            </button>
        </div>
    )
}
