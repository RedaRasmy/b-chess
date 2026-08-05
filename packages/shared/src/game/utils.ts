import { Chess, Color } from "chess.js"
import { Reason, Result, TimerOption } from "./constants"
import { ChessTimer, ColorName } from "./types"

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

export function formatMs(ms: number, precise = false) {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const tenths = Math.floor((ms % 1000) / 100)

    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    return precise
        ? `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`
        : `${minutes}:${String(seconds).padStart(2, "0")}`
}

export function winProbability(r1: number, r2: number) {
    const power = (r2 - r1) / 400
    return 1 / (1 + 10 ** power)
}

export function calcElo({
    whiteRating,
    blackRating,
    result,
}: {
    whiteRating: number
    blackRating: number
    result: Result
}) {
    const K = 30
    const pW = winProbability(whiteRating, blackRating)
    const sW = result === "draw" ? 0.5 : result === "white_won" ? 1 : 0

    const whiteDiff = Math.round(K * (sW - pW))
    const blackDiff = -whiteDiff
    const newWhiteRating = Math.max(0, whiteRating + whiteDiff)
    const newBlackRating = Math.max(0, blackRating + blackDiff)

    return {
        newWhiteRating,
        newBlackRating,
        whiteDiff,
        blackDiff,
        diff: Math.abs(whiteDiff),
    }
}

export type Elo = ReturnType<typeof calcElo>

export function getColorName(color: Color | ColorName): ColorName {
    if (color === "w" || color === "white") return "white"
    return "black"
}

export function getColor(color: Color | ColorName): Color {
    if (color === "w" || color === "white") return "w"
    return "b"
}

export function getOppositeColor(color: Color | ColorName): Color {
    if (color === "w" || color === "white") return "b"
    return "w"
}

export function validateRatingRange(min: number, max: number): boolean {
    if (min > max) return false
    if (min > max - 200) return false
    if (max < 100) return false
    if (max + min < 0) return false

    return true
}
