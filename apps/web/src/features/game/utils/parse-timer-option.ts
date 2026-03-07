import { ChessTimer, TimerOption } from "@/features/game/types"

export default function parseTimerOption(timerOption: TimerOption): ChessTimer {
    const [type, time] = timerOption.split(" ")
    const [base, plus] = time.split("+")

    return {
        type: type as ChessTimer["type"],
        base: Number(base) * 60 ,
        plus: Number(plus),
    }
}
