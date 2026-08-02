import { api } from "@/lib/api"
import { TopPlayer } from "@bchess/shared"

export async function fetchTopPlayers(query: {
    page?: number
    limit?: number
}) {
    const res = await api.get<TopPlayer[]>("/players/top", {
        params: query,
    })

    return res.data
}
