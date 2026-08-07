import { Record } from "@/features/players/components/record"
import PlayerAvatar from "@/features/profile/components/player-avatar"
import { TopPlayer } from "@bchess/shared"
import { TableCell, TableRow } from "@/components/ui/table"

type Accent = {
    border: string
    text: string
}

const RANK_ACCENT: Record<number, Accent> = {
    1: { border: "border-l-primary", text: "text-primary" },
    2: { border: "border-l-amber-400", text: "text-amber-400" },
    3: { border: "border-l-zinc-400", text: "text-zinc-300" },
    // 3: { border: "border-l-orange-400", text: "text-orange-400" },
}
const DEFAULT_ACCENT = {
    border: "border-l-transparent",
    text: "text-stone-500",
}

export function PlayerRow({
    player,
    rank,
}: {
    player: TopPlayer
    rank: 1 | 2 | 3 | number
}) {
    const accent = RANK_ACCENT[rank] || DEFAULT_ACCENT
    const total = player.wins + player.losses + player.draws
    const winPct = total ? Math.round((player.wins / total) * 100) : 0

    return (
        <TableRow className="">
            <TableCell
                className={`text-right font-serif text-lg font-medium tabular-nums border-l-2 ${accent.border} ${accent.text}`}
            >
                {rank}
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar
                        username={player.username}
                        avatar={player.image}
                        className="size-8"
                    />
                    <div className="min-w-0">
                        <div className="truncate text-stone-100 text-sm font-medium">
                            {player.username}
                        </div>
                        <div className="sm:hidden mt-0.5">
                            <Record
                                wins={player.wins}
                                losses={player.losses}
                                draws={player.draws}
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-3 mt-0.5">
                            <Record
                                wins={player.wins}
                                losses={player.losses}
                                draws={player.draws}
                            />
                            <span className="text-stone-500 text-xs">
                                {winPct}% win rate
                            </span>
                        </div>
                    </div>
                </div>
            </TableCell>

            <TableCell className="text-right font-mono text-base sm:text-lg font-semibold text-stone-100 tabular-nums">
                {player.rating}
            </TableCell>
        </TableRow>
    )
}
