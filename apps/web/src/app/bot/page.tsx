"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Timer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useBotStore } from "@/features/bot/store"
import SelectColor from "@/features/bot/components/select-color"
import { useState } from "react"
import { ColorOption } from "@/features/bot/types"
import SelectTimer from "@/features/game/components/select-timer"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { parseTimerOption, TimerOption } from "@bchess/shared"

export default function BotOptions() {
    const { startBotGame } = useBotStore()
    const [level, setLevel] = useState(1)
    const [playerColor, setPlayerColor] = useState<ColorOption>("white")
    const [timer, setTimer] = useState<TimerOption | null>("rapid 10+0")
    const router = useRouter()
    const { data: session } = authClient.useSession()
    const user = session?.user
    const player = user
        ? {
              id: user.id,
              avatar: user.image ?? null,
              username: user.username ?? "You",
              status: null,
          }
        : undefined

    function handleStart() {
        const color =
            playerColor === "random"
                ? Math.random() > 0.5
                    ? "white"
                    : "black"
                : playerColor

        const timeControl = timer
            ? {
                  initial: parseTimerOption(timer).base * 1000,
                  increment: parseTimerOption(timer).plus * 1000,
              }
            : undefined
        startBotGame({
            timeControl,
            difficulty: level,
            playerColor: color,
            player,
        })
        router.push("/bot/play")
    }

    return (
        <div className="grid py-2 items-center overflow-auto w-full px-2 lg:px-10 xl:px-15 h-full">
            <Card className="px-4 py-6 md:space-y-2 w-full xl:px-10 max-w-5xl mx-auto">
                <CardHeader>
                    <h1 className="text-2xl font-semibold flex gap-3 items-center">
                        <Bot size={30} />
                        Bot
                    </h1>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col justify-center w-full h-full gap-6 lg:gap-10 lg:flex-row not-lg:max-w-md mx-auto">
                        <div className="flex flex-col lg:items-center justify-center w-full h-full">
                            <h1 className="text-xl items-center font-semibold mb-4 lg:mb-6 flex gap-2 ">
                                <Timer />
                                Timer
                                <span className="text-xs text-muted-foreground">
                                    (optional)
                                </span>
                            </h1>
                            <div className="flex items-center justify-center w-full flex-col">
                                <SelectTimer
                                    className="w-full"
                                    value={timer}
                                    onChange={setTimer}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-5 w-full md:space-y-3 ">
                            <div className="space-y-5 md:space-y-8 w-full">
                                <div className="flex flex-col lg:items-center justify-center w-full max-w-[min(100%,400px)">
                                    <h1 className="text-xl text-nowrap items-center justify-between font-semibold mb-4 flex gap-2 w-full ">
                                        Difficulty Level
                                        <Badge className="h-4 w-20 rounded-lg">
                                            Level {level}
                                        </Badge>
                                    </h1>
                                    <Slider
                                        max={20}
                                        step={1}
                                        onValueChange={(e) => setLevel(e[0]!)}
                                        value={[level]}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl text-nowrap items-center justify-between font-semibold mb-4 lg:mb-5 flex gap-2 w-full ">
                                        Your Color
                                    </h1>
                                    <SelectColor
                                        onChange={(color) =>
                                            setPlayerColor(color)
                                        }
                                        value={playerColor}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-full ">
                                <Button
                                    className="w-full lg:text-xl max-w-m py-7 lg:py-10  cursor-pointer"
                                    onClick={handleStart}
                                    variant={"destructive"}
                                >
                                    Start
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
