"use client"
import BotControls from "@/features/bot/components/bot-controls"
import BotEndDialog from "@/features/bot/components/bot-end-dialog"
import useBot from "@/features/bot/use-bot"
import GameBoard from "@/features/game/components/game-board"
import PlayerInfo from "@/features/game/components/player-info"
import { useGameStore } from "@/features/game/game-store"
import { getColor } from "@bchess/shared"

export default function Page() {
    useBot()
    const playerColor = useGameStore((s) => s.playerColor)

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
            <BotControls />
        </div>
    )
}
