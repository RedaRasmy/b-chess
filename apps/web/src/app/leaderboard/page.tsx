import { PlayerRow } from '@/features/players/components/player-row';
import { fetchTopPlayers } from '@/features/players/requests';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leaderboard',
};

export const revalidate = 60;

export default async function LeaderboardPage() {
    const players = await fetchTopPlayers({});

    return (
        <div className="w-full flex justify-center px-3 py-10 sm:py-16">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="mb-7 px-1">
                    <h1 className="mt-1.5 text-3xl font-semibold">Leaderboard</h1>
                </div>

                {/* Table */}
                <div className="rounded-lg overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="">
                                <TableHead className="w-11 font-mono text-[10px] tracking-widest uppercase ">
                                    #
                                </TableHead>
                                <TableHead className="font-mono text-[10px] tracking-widest uppercase ">
                                    Player
                                </TableHead>
                                <TableHead className="text-right font-mono text-[10px] tracking-widest uppercase ">
                                    Rating
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {players.length > 0 ? (
                                players.map((player, i) => (
                                    <PlayerRow key={player.userId} player={player} rank={i + 1} />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-sm py-10">
                                        No ranked players yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
