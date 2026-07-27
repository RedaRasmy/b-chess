import { TimerOption } from "./constants"
import { ChessTimer } from "./types"

export function parseTimerOption(timerOption: TimerOption): ChessTimer {
    const [type, time] = timerOption.split(" ")

    if (!type || !time) {
        throw new Error("Invalid timerOption")
    }

    const [base, plus] = time.split("+")

    if (!base || !plus) {
        throw new Error("Invalid timerOption")
    }

    return {
        type: type as ChessTimer["type"],
        base: Number(base) * 60,
        plus: Number(plus),
    }
}
