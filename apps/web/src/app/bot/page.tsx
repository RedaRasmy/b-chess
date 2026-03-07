"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Timer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useBotStore } from "@/features/bot/store"
import SelectColor from "@/features/bot/components/select-color"
import { useState } from "react"
import { TimerOption } from "@/features/game/types"
import { ColorOption } from "@/features/bot/types"
import parseTimerOption from "@/features/game/utils/parse-timer-option"
import SelectTimer from "@/features/game/components/select-timer"
import { useRouter } from "next/navigation"

export default function BotOptions() {
    const { startBotGame } = useBotStore()
    const [level, setLevel] = useState(1)
    const [playerColor, setPlayerColor] = useState<ColorOption>("white")
    const [timer, setTimer] = useState<TimerOption | null>("rapid 10+0")
    const router = useRouter()

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
        })
        router.push("/bot/play")
    }

    return (
        <div className="space-y-5 flex flex-col w-full">
            <div className="flex items-center gap-2 flex-col">
                <h1 className="text-3xl font-bold">Play vs Bot</h1>
                <p className="text-muted-foreground">
                    Practice against our intelligent AI opponents
                </p>
            </div>

            <Card className="">
                <CardHeader>
                    <div>
                        <h1 className="text-2xl font-semibold flex gap-3 items-center">
                            <Bot />
                            Bot Configuration
                        </h1>
                        <p className="text-muted-foreground">
                            Customize your AI opponent
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col  gap-5 lg:gap-7 w-full">
                        <div className="flex flex-col lg:justify-around gap-5 lg:gap-7 xl:flex-row">
                            <div className="flex flex-col gap-5 lg:gap-7 w-full ">
                                <div className="flex flex-col lg:items-center justify-center w-full max-w-[min(100%,400px)]">
                                    <h1 className="text-xl text-nowrap items-center justify-between font-semibold mb-4 flex gap-2 w-full ">
                                        Difficulty Level
                                        <Badge className="h-4 w-20 rounded-lg">
                                            Level {level}
                                        </Badge>
                                    </h1>
                                    <Slider
                                        max={20}
                                        step={1}
                                        onValueChange={(e) => setLevel(e[0])}
                                        value={[level]}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl text-nowrap items-center justify-between font-semibold mb-4 flex gap-2 w-full ">
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
                            <div className="flex flex-col lg:items-center justify-center w-full ">
                                <h1 className="text-xl items-center font-semibold mb-4 lg:mb-6 flex gap-2 ">
                                    <Timer />
                                    Time Control
                                    <span className="text-xs text-muted-foreground">
                                        (optional)
                                    </span>
                                </h1>
                                <div className="flex items-center justify-center w-full flex-col">
                                    <SelectTimer
                                        className=""
                                        value={timer}
                                        onChange={setTimer}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row-reverse gap-2">
                            <Button
                                className="w-full lg:max-w-xs py-5 cursor-pointer"
                                onClick={handleStart}
                                variant={"outline"}
                            >
                                Start
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
