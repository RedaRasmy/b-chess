"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import SelectTimer from "@/features/game/components/select-timer"
import { useSocket } from "@/features/multiplayer/hooks/use-socket"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { fetchIsMatching } from "@/features/multiplayer/requests"
import { TimerOption, validateRatingRange } from "@bchess/shared"
import { useQuery } from "@tanstack/react-query"
import { Timer, TrendingUp, Users, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export default function Page() {
    const [isMatching, setIsMatching] = useState(false)
    const socket = useSocket()
    const [timer, setTimer] = useState<TimerOption>("rapid 10+0")
    const [range, setRange] = useState<[number, number]>([-100, 100])
    const [localRange, setLocalRange] = useState(range)

    useEffect(() => {
        setLocalRange(range)
    }, [range])

    function handleStart() {
        socket.emit("join_queue", {
            timer,
            min: range[0],
            max: range[1],
        })
        setIsMatching(true)
    }

    function handleCancel() {
        socket.emit("cancel_match")
        setIsMatching(false)
    }

    const { data, isPending } = useQuery({
        queryKey: ["isMatching"],
        queryFn: fetchIsMatching,
    })

    useEffect(() => {
        if (!isPending && data !== undefined) {
            setIsMatching(data)
        }
    }, [data, isPending])

    useSocketListener("queue_joined", () => {
        console.log("queue joined")
    })

    return (
        <div className="grid py-2 items-center overflow-auto w-full px-2 xl:px-20 h-full">
            <Card className="px-4 py-6 md:space-y-5 w-full xl:px-10 ">
                <CardHeader>
                    <h1 className="text-2xl font-semibold flex gap-3 items-center">
                        <Users size={40} />
                        Multiplayer Configuration
                    </h1>
                </CardHeader>
                <CardContent className="w-full flex justify-center">
                    <div className="flex flex-col w-full h-full gap-6 lg:gap-10 lg:flex-row not-lg:max-w-md">
                        <div className="flex flex-col lg:items-center justify-center w-full h-full">
                            <h1 className="text-xl items-center font-semibold mb-4 lg:mb-6 flex gap-2 ">
                                <Timer />
                                Timer
                            </h1>
                            <div className="flex items-center justify-center w-full flex-col">
                                <SelectTimer
                                    className=""
                                    value={timer}
                                    onChange={setTimer}
                                    required
                                    disabled={isMatching}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-5 w-full md:space-y-3 lg:space-5">
                            <div className="my-5 w-full space-y-5 lg:space-y-6">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size={"sm"}
                                            onClick={() =>
                                                setRange([-100, 100])
                                            }
                                            className="cursor-pointer"
                                            variant={"outline"}
                                            disabled={isMatching}
                                        >
                                            default
                                        </Button>
                                        <Button
                                            size={"icon-sm"}
                                            onClick={() =>
                                                setRange([-400, 400])
                                            }
                                            className="cursor-pointer"
                                            disabled={isMatching}
                                        >
                                            <Zap />
                                        </Button>
                                        <Button
                                            size={"icon-sm"}
                                            onClick={() => setRange([200, 400])}
                                            className="cursor-pointer"
                                            disabled={isMatching}
                                        >
                                            <TrendingUp />
                                        </Button>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {localRange.join(", ")}
                                    </span>
                                </div>
                                <Slider
                                    disabled={isMatching}
                                    value={localRange}
                                    max={400}
                                    min={-400}
                                    step={50}
                                    className="w-full"
                                    onValueChange={([x, y]) => {
                                        if (x === undefined || y === undefined)
                                            return
                                        setLocalRange([x, y])
                                    }}
                                    onValueCommit={([x, y]) => {
                                        if (x === undefined || y === undefined)
                                            return

                                        if (validateRatingRange(x, y)) {
                                            setRange([x, y])
                                        } else {
                                            setLocalRange(range)
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-center w-full ">
                                {isMatching ? (
                                    <Button
                                        className="w-full lg:text-xl max-w-m py-7 lg:py-10 cursor-pointer"
                                        onClick={handleCancel}
                                        variant={"outline"}
                                        disabled={isPending}
                                    >
                                        Cancel
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full lg:text-xl max-w-m py-7 lg:py-10 cursor-pointer"
                                        onClick={handleStart}
                                        variant={"destructive"}
                                        disabled={isPending}
                                    >
                                        Start
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
