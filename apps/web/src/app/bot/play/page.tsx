"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useBotStore } from "@/features/bot/store"
import useBot from "@/features/bot/use-bot"
import HistoryController from "@/features/game/components/history-controller"
import PlayerInfo from "@/features/game/components/player-info"
import { useGameStore } from "@/features/game/game-store"
import { getColor } from "@/features/game/utils/get-color"
import { Square } from "chess.js"
import { Plus, RotateCcw, Undo } from "lucide-react"
import Link from "next/link"
import { Chessboard } from "react-chessboard"

export default function Page() {
    useBot()
    const {
        result,
        endReason,
        playerColor,
        resetGame,
        displayFen,
        selectSquare,
        legalMoves,
        selectedSquare,
        undo,
        moveHistory,
    } = useGameStore()
    const replay = useBotStore((s) => s.replayBotGame)

    const canUndo =
        playerColor === "white"
            ? moveHistory.length > 0
            : moveHistory.length > 1

    const isDraw = result === "draw"
    const isWin = result === playerColor
    const opponentColor =
        playerColor === null ? null : playerColor === "white" ? "b" : "w"
    const color = playerColor === null ? null : getColor(playerColor)

    const isGameOver = result !== null

    function onPieceDrop(from: Square, to: Square) {
        const prevFen = useGameStore.getState().fen
        selectSquare(from)
        selectSquare(to)
        return useGameStore.getState().fen !== prevFen
    }

    const legalMoveStyles = Object.fromEntries(
        legalMoves.map((sq) => [
            sq,
            {
                background:
                    "radial-gradient(circle, color-mix(in oklch, var(--primary) 70%, transparent) 25%, transparent 25%)",
            },
        ]),
    )

    return (
        <div className="flex flex-wrap w-full h-full gap-3 lg:gap-5 xl:gap-8">
            {isGameOver && (
                <Dialog defaultOpen>
                    <DialogContent className="">
                        <DialogHeader>
                            <DialogTitle>
                                {isDraw
                                    ? "You Draw"
                                    : isWin
                                      ? "You Won"
                                      : "You Lost"}
                            </DialogTitle>
                            <DialogDescription>
                                By {endReason}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button asChild variant="outline">
                                <Link href={"/"}>Home</Link>
                            </Button>
                            <Button className="cursor-pointer" onClick={replay}>
                                Replay
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            <div className="flex-auto flex justify-center items-center">
                <div className="flex flex-col w-full max-w-[75vh] gap-2 px-1">
                    <PlayerInfo color={opponentColor} />
                    <Chessboard
                        options={{
                            boardStyle: {
                                borderRadius: 5,
                            },
                            darkSquareStyle: {
                                backgroundColor: "var(--secondary)",
                            },
                            lightSquareStyle: {
                                backgroundColor:
                                    "oklch(from var(--primary) l c h / 0.5)",
                            },
                            darkSquareNotationStyle: {
                                color: "var(--primary)",
                            },
                            lightSquareNotationStyle: {
                                color: "black",
                            },
                            boardOrientation: playerColor ?? "white",
                            position: displayFen,
                            onSquareClick: ({ square }) =>
                                selectSquare(square as Square),
                            onPieceDrop: ({ sourceSquare, targetSquare }) =>
                                onPieceDrop(
                                    sourceSquare as Square,
                                    targetSquare as Square,
                                ),
                            squareStyles: {
                                ...legalMoveStyles,
                                ...(selectedSquare && {
                                    [selectedSquare]: {
                                        backgroundColor:
                                            "color-mix(in oklch, var(--primary) 20%, transparent)",
                                    },
                                }),
                            },
                        }}
                    />
                    <PlayerInfo color={color} />
                </div>
            </div>
            <div className="bg-secondary flex-1 w-full landscape:min-w-80 lg:py-5 flex flex-col gap-5 lg:gap-8 justify-center items-center border-l border-black/30 ">
                <div className="flex flex-col w-full items-center px-2 lg:px-4 gap-1  ">
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
