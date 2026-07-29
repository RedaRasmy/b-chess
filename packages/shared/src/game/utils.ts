import { Chess } from "chess.js"
import { Reason, Result, TimerOption } from "./constants"
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

export function checkGameEnd(chess: Chess) {
    if (chess.isGameOver()) {
        let result: Result | null = null
        let reason: Reason | null = null

        if (chess.isCheckmate()) {
            result = chess.turn() === "w" ? "black_won" : "white_won"
            reason = "Checkmate"
        } else if (chess.isStalemate()) {
            result = "draw"
            reason = "Stalemate"
        } else if (chess.isInsufficientMaterial()) {
            result = "draw"
            reason = "Insufficient material"
        } else if (chess.isThreefoldRepetition()) {
            result = "draw"
            reason = "Threefold repetition"
        } else if (chess.isDraw()) {
            result = "draw"
            reason = "Agreement"
        } else if (chess.isDrawByFiftyMoves()) {
            result = "draw"
            reason = "Fifty moves rule"
        }

        if (!result || !reason) {
            throw new Error("GameStore: Unhandled game-over case")
        }

        return {
            result,
            reason,
        }
    }
    return null
}
