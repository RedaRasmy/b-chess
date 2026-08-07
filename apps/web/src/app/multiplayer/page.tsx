"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import SelectTimer from "@/features/game/components/select-timer"
import RatingRange from "@/features/multiplayer/components/rating-range"
import { useSocket } from "@/features/multiplayer/hooks/use-socket"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { fetchIsMatching } from "@/features/multiplayer/requests"
import { TimerOption } from "@bchess/shared"
import { useQuery } from "@tanstack/react-query"
import { Swords, Timer } from "lucide-react"
import { useEffect, useState } from "react"

export default function Page() {
    const [isMatching, setIsMatching] = useState(false)
    const socket = useSocket()
    const [timer, setTimer] = useState<TimerOption>("rapid 10+0")
    const [range, setRange] = useState<[number, number]>([-100, 100])

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
        <div className="grid py-2 items-center overflow-auto w-full px-2 lg:px-10 xl:px-15 h-full">
            <Card className="px-4 py-6 md:space-y-5 w-full xl:px-10 max-w-5xl mx-auto">
                <CardHeader className="bg-card">
                    <h1 className="text-2xl font-semibold flex gap-3 items-center">
                        <Swords size={30} />
                        Multiplayer
                    </h1>
                </CardHeader>
                <CardContent className="w-full flex justify-center">
                    <div className="flex flex-col w-full h-full gap-6 lg:gap-10 xl:flex-row not-xl:max-w-md">
                        <div className="flex flex-col lg:items-center justify-center w-full h-full">
                            <h1 className="text-xl items-center font-semibold mb-4 lg:mb-6 flex gap-2 ">
                                <Timer />
                                Timer
                            </h1>
                            <div className="flex items-center justify-center w-full flex-col">
                                <SelectTimer
                                    className="w-full"
                                    value={timer}
                                    onChange={setTimer}
                                    required
                                    disabled={isMatching}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-5 w-full md:space-y-3 lg:space-5">
                            <RatingRange
                                range={range}
                                onRangeChange={setRange}
                                disabled={isMatching}
                            />
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
