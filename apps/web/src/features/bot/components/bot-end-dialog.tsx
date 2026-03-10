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
import { useGameStore } from "@/features/game/game-store"
import Link from "next/link"

export default function BotEndDialog() {
    const result = useGameStore((s) => s.result)
    const playerColor = useGameStore((s) => s.playerColor)
    const endReason = useGameStore((s) => s.endReason)
    const replay = useBotStore((s) => s.replayBotGame)

    const isGameOver = result !== null
    const isDraw = result === "draw"
    const isWin = result === playerColor

    if (isGameOver)
        return (
            <Dialog defaultOpen>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isDraw
                                ? "You Draw"
                                : isWin
                                  ? "You Won"
                                  : "You Lost"}
                        </DialogTitle>
                        <DialogDescription>By {endReason}</DialogDescription>
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
        )
}
