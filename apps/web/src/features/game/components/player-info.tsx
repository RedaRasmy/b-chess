import { Color, PieceSymbol } from "chess.js"
import { PlayerTimer } from "./player-timer"
import { useGameStore } from "@/features/game/game-store"
import { getMaterialState } from "@/features/game/utils/get-material-state"
import ChessPieceImage from "@/features/game/components/chess-piece-image"
import { Skeleton } from "@/components/ui/skeleton"
import PlayerAvatar from "@/features/profile/components/player-avatar"
import { getColor, getOppositeColor } from "@bchess/shared"

export default function PlayerInfo({ color }: { color: Color | null }) {
    const { chess, clock, results, players } = useGameStore()

    if (!color || !players)
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

    const player = color === "w" ? players.white : players.black
    const playerColor = players.playerColor

    const { captured, advantage } = getMaterialState(chess)

    const playerPoints = color === "w" ? advantage.white : advantage.black
    const capturedPieces = color === "w" ? captured.white : captured.black

    const diff = results
        ? color === "w"
            ? results.whiteEloDiff
            : results.blackEloDiff
        : null

    const showStatus = playerColor && color !== getColor(playerColor)

    const status = showStatus ? player.status : null

    const pieces: PieceSymbol[] = ["p", "b", "n", "r", "q"]

    const opponentColor = getOppositeColor(color)

    return (
        <div className="bg-accent/70 rounded-sm flex items-center justify-between gap-3 px-1 md:px-3 py-1.5 w-full">
            <div className="flex items-center">
                <PlayerAvatar
                    className="size-9 mr-2 md:mr-3"
                    username={player.username}
                    avatar={player.avatar}
                    status={status}
                />
                <div className="flex flex-col -mt-1">
                    <p className="text-muted-foreground">{player.username}</p>
                    {player.rating !== undefined && (
                        <div className="text-primary/70 text-xs md:text-sm ">
                            <div className="py-0 text-xs bg-primary px-2 text-white rounded-xl flex gap-0.5">
                                {player.rating}
                                {diff !== null && (
                                    <span>
                                        {diff >= 0 && "+"}
                                        {diff}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center h-full ml-2">
                    {pieces.map((type, index) => (
                        <div
                            key={pieces[index]}
                            className="flex h-full -space-x-3 items-center justify-center"
                        >
                            {Array.from(
                                { length: capturedPieces[type]! },
                                (_, i) => i,
                            ).map((_, i) => (
                                <ChessPieceImage
                                    key={i}
                                    piece={{
                                        color: opponentColor,
                                        type,
                                    }}
                                    size={20}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                {playerPoints > 0 && (
                    <p className="text-sm ml-1">+{playerPoints}</p>
                )}
            </div>
            <div>
                {clock && (
                    <PlayerTimer color={color === "w" ? "white" : "black"} />
                )}
            </div>
        </div>
    )
}
