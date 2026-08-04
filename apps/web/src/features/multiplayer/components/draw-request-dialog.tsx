import { useGameStore } from "@/features/game/game-store"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { useState } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/features/multiplayer/hooks/use-socket"
import { getColor } from "@bchess/shared"

export default function DrawRequestDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const playerColor = useGameStore((s) => s.playerColor)
    const socket = useSocket()

    useSocketListener("draw_request", ({ requestDraw }) => {
        const open = !!playerColor && requestDraw !== getColor(playerColor)

        setIsOpen(open)
    })

    function handleAccept() {
        socket.emit("accept_draw")
    }

    function handleReject() {
        socket.emit("reject_draw")
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        Your opponent is asking for a draw
                    </DialogTitle>
                    <DialogDescription>You want to accept?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={handleReject}>
                            Reject
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={handleAccept} variant={"destructive"}>
                            Draw
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
