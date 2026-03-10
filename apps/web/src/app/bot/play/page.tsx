"use client"
import { Button } from "@/components/ui/button"
import BotEndDialog from "@/features/bot/components/bot-end-dialog"
import { useBotStore } from "@/features/bot/store"
import useBot from "@/features/bot/use-bot"
import GameBoard from "@/features/game/components/game-board"
import HistoryController from "@/features/game/components/history-controller"
import PlayerInfo from "@/features/game/components/player-info"
import { useGameStore } from "@/features/game/game-store"
import { getColor } from "@/features/game/utils/get-color"
import { Plus, RotateCcw, Undo } from "lucide-react"
import Link from "next/link"

export default function Page() {
    useBot()
    const { playerColor, resetGame, undo, moveHistory } = useGameStore()
    const replay = useBotStore((s) => s.replayBotGame)

    const canUndo =
        playerColor === "white"
            ? moveHistory.length > 0
            : moveHistory.length > 1

    const opponentColor =
        playerColor === null ? null : playerColor === "white" ? "b" : "w"
    const color = playerColor === null ? null : getColor(playerColor)

    return (
        <div className="flex flex-wrap w-full h-full gap-3 lg:gap-5 xl:gap-8">
            <BotEndDialog />
            <div className="flex-auto flex justify-center items-center">
                <div className="flex flex-col w-full max-w-[75vh] gap-2 px-1">
                    <PlayerInfo color={opponentColor} />
                    <GameBoard />
                    <PlayerInfo color={color} />
                </div>
            </div>
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
        </div>
    )
}
