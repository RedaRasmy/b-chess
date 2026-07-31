import { EmptyGameHistory } from "@/features/profile/components/empty-game-history"
import { GameHistoryItem } from "@/features/profile/components/game-history-item"
import { GameHistorySkeleton } from "@/features/profile/components/game-history-skeleton"
import { fetchGames } from "@/features/profile/requests"
import { useQuery } from "@tanstack/react-query"

export default function GameHistory() {
    const { data, isPending } = useQuery({
        queryKey: ["games"],
        queryFn: fetchGames,
    })

    if (isPending || !data) return <GameHistorySkeleton />

    if (data.length === 0) return <EmptyGameHistory />

    return (
        <div className="w-full space-y-2 lg:w-xl xl:w-2xl">
            <h1 className="text-xl text-foreground/70 font-semibo">
                Game History
            </h1>
            <div className="flex flex-col gap-2 overflow-aut">
                {data.map((game) => (
                    <GameHistoryItem game={game} key={game.id} />
                ))}
            </div>
        </div>
    )
}
