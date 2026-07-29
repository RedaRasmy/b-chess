"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import SelectTimer from "@/features/game/components/select-timer"
import { useGameStore } from "@/features/game/game-store"
import { useSocket } from "@/features/multiplayer/hooks/use-socket"
import { useSocketListener } from "@/features/multiplayer/hooks/use-socket-listener"
import { fetchIsMatching } from "@/features/multiplayer/requests"
import { TimerOption } from "@bchess/shared"
import { useQuery } from "@tanstack/react-query"
import { Timer, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
    const [isMatching, setIsMatching] = useState(false)
    const socket = useSocket()
    const [timer, setTimer] = useState<TimerOption>("rapid 10+0")
    const router = useRouter()
    const gameState = useGameStore()

    function handleStart() {
        socket.emit("join_queue", {
            timer,
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

    useSocketListener("queue_joined", ({ gameId }) => {
        console.log("queue joined")
    })

    useSocketListener("game_found", (game) => {
        console.log("game found: ", game)
        gameState.resetGame()
        gameState.setMode("multiplayer")
        gameState.setStatus(game.status)

        router.push(`/multiplayer/play`)
    })

    return (
        <div className="grid py-2 items-center overflow-auto w-full px-2 xl:px-20 ">
            <Card className="px-4 py-6 md:space-y-5 w-full xl:px-10 ">
                <CardHeader>
                    <h1 className="text-2xl font-semibold flex gap-3 items-center">
                        <Users size={40} />
                        Multiplayer Configuration
                    </h1>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col w-full h-full gap-6 lg:gap-10 lg:flex-row">
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
                        <div className="flex flex-col items-center gap-5 w-full md:space-y-3">
                            <div className="flex bg-red- h-full items-center justify-center w-full ">
                                {isMatching ? (
                                    <Button
                                        className="w-full lg:text-xl max-w-md py-7 lg:py-10 cursor-pointer"
                                        onClick={handleCancel}
                                        variant={"outline"}
                                        disabled={isPending}
                                    >
                                        Cancel
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full lg:text-xl max-w-md py-7 lg:py-10 cursor-pointer"
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
