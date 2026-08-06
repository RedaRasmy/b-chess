import { Button } from "@/components/ui/button"
import { useBotStore } from "@/features/bot/store"
import HistoryController from "@/features/game/components/history-controller"
import { useGameStore } from "@/features/game/game-store"
import { Plus, RotateCcw, Undo } from "lucide-react"
import Link from "next/link"

export default function BotControls() {
    const playerColor = useGameStore((s) => s.players?.playerColor)
    const moveHistory = useGameStore((s) => s.moveHistory)
    const undo = useGameStore((s) => s.undo)
    const resetGame = useGameStore((s) => s.resetGame)
    const replay = useBotStore((s) => s.replayBotGame)

    const canUndo =
        playerColor === "white"
            ? moveHistory.length > 0
            : moveHistory.length > 1

    return (
        <div className="bg-secondary flex-1 w-full landscape:min-w-80 py-5 flex flex-col gap-5 lg:gap-8 justify-center items-center border-l border-black/30 ">
            <div className="flex flex-col w-full items-center px-2 lg:px-4 gap-1">
                <Button
                    className="cursor-pointer font-semibold max-w-70 w-full "
                    onClick={undo}
                    variant={"outline"}
                    disabled={!canUndo}
                >
                    <Undo />
                    Undo
                </Button>
                <Button
                    className="cursor-pointer font-semibold max-w-70 w-full"
                    onClick={replay}
                    variant={"outline"}
                >
                    <RotateCcw />
                    Replay
                </Button>
                <Button
                    asChild
                    className="cursor-pointer font-semibold max-w-70 w-full"
                    onClick={resetGame}
                    variant={"outline"}
                >
                    <Link href="/bot">
                        <Plus />
                        New Game
                    </Link>
                </Button>
            </div>
            <HistoryController />
        </div>
    )
}
