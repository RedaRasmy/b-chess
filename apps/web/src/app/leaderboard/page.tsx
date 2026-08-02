import { PlayerRow } from "@/features/players/components/player-row"
import { fetchTopPlayers } from "@/features/players/requests"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function LeaderboardPage() {
    const players = await fetchTopPlayers({})

    return (
        <div className="w-full flex justify-center bg-stone-950 px-3 py-10 sm:py-16">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="mb-7 px-1">
                    <h1 className="mt-1.5 text-stone-100 text-3xl font-serif font-semibold tracking-tight">
                        Leaderboard
                    </h1>
                </div>

                {/* Table */}
                <div className="rounded-lg overflow-hidden bg-stone-900 border border-stone-800 ">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-stone-800 border-stone-800 hover:bg-stone-800">
                                <TableHead className="w-11 font-mono text-[10px] tracking-widest uppercase text-stone-500">
                                    #
                                </TableHead>
                                <TableHead className="font-mono text-[10px] tracking-widest uppercase text-stone-500">
                                    Player
                                </TableHead>
                                <TableHead className="text-right font-mono text-[10px] tracking-widest uppercase text-stone-500">
                                    Rating
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {players.length > 0 ? (
                                players.map((player, i) => (
                                    <PlayerRow
                                        key={player.userId}
                                        player={player}
                                        rank={i + 1}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center text-stone-400 text-sm py-10"
                                    >
                                        No ranked players yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
