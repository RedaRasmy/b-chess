import { api } from "@/lib/api"
import { Stats } from "@bchess/shared"

export async function fetchStats() {
    return (await api.get<Stats>("/profile/stats")).data
}
