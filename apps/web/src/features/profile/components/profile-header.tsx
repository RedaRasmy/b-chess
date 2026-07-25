import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { Activity, TrendingDown, TrendingUp } from "lucide-react"
import { Stats } from "@bchess/shared"

type Props = {
    username: string
    stats: Stats
}

export default function ProfileHeader({ username, stats }: Props) {
    console.log("stats:", stats)

    const { losses, wins, draws } = stats

    // const gamesPlayed = losses + wins + draws

    // const winRate =
    //     wins === 0 || gamesPlayed === 0
    //         ? 0
    //         : parseFloat(((wins / gamesPlayed) * 100).toFixed(2))

    return (
        <Card className="px-6 py-5 w-full lg:w-xl my-auto space-y-2">
            <CardHeader>
                <div className="flex gap-5 items-center justify-between">
                    <h1 className="text-2xl  font-semibold">{username}</h1>
                    <LogoutButton size="sm" className="-mb-1" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-around">
                    <div className="flex flex-col gap-1 lg:gap-2 items-center">
                        <div className="flex gap-2 items-center">
                            <TrendingUp color="green" />
                            <span className="text-xl font-semibold">
                                {wins}
                            </span>
                        </div>
                        <p className="text-muted-foreground">Wins</p>
                    </div>
                    <div className="flex flex-col gap-1 lg:gap-2 items-center">
                        <div className="flex gap-2 items-center">
                            <Activity color="yellow" />
                            <span className="text-xl font-semibold">
                                {draws}
                            </span>
                        </div>
                        <p className="text-muted-foreground">Draws</p>
                    </div>
                    <div className="flex flex-col gap-1 lg:gap-2 items-center">
                        <div className="flex gap-2 items-center">
                            <TrendingDown color="red" />
                            <span className="text-xl font-semibold">
                                {losses}
                            </span>
                        </div>
                        <p className="text-muted-foreground">Losses</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
