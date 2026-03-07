import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Color, PieceSymbol } from "chess.js"
import { PlayerTimer } from "./player-timer"
import { useGameStore } from "@/features/game/game-store"
import { getMaterialState } from "@/features/game/utils/get-material-state"
import ChessPieceImage from "@/features/game/components/chess-piece-image"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlayerInfo({ color }: { color: Color | null }) {
    const { white, black, fen, clock } = useGameStore()

    const { captured, advantage } = getMaterialState(fen)

    const player = color === "w" ? white : black
    const playerPoints = color === "w" ? advantage.white : advantage.black
    const capturedPieces = color === "w" ? captured.white : captured.black

    if (!color || !player)
        return (
            <div className="">
                <div className="bg-accent/70 rounded-md flex items-center justify-between gap-2 px-2 py-2 h-fit w-full">
                    <div className="flex items-center gap-2">
                        <Skeleton className="size-8 rounded-full" />
                        <Skeleton className="w-12 h-3" />
                    </div>
                    <Skeleton className="w-15 h-7" />
                </div>
            </div>
        )

    const pieces: PieceSymbol[] = ["p", "b", "n", "r", "q"]

    return (
        <div className="bg-accent/70 rounded-sm flex items-center justify-between gap-2 px-2 py-2 h-fit w-full">
            <div className="flex items-center gap-2">
                <Avatar className="border-2 border-gray-300">
                    <AvatarImage
                        src={player.avatar ?? "/images/default-avatar.jpg"}
                    />
                    <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <p className="font-bold">{player.username}</p>
                <div className="flex items-center h-full ">
                    {pieces.map((type, index) => (
                        <div
                            key={pieces[index]}
                            className="flex h-full -space-x-3 items-center justify-center"
                        >
                            {Array.from(
                                { length: capturedPieces[type] },
                                (_, i) => i,
                            ).map((_, i) => (
                                <ChessPieceImage
                                    key={i}
                                    piece={{
                                        color,
                                        type,
                                    }}
                                    size={20}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                {playerPoints > 0 && <p>+{playerPoints}</p>}
            </div>
            <div>
                {clock && (
                    <PlayerTimer color={color === "w" ? "white" : "black"} />
                )}
            </div>
        </div>
    )
}
