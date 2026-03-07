import { getCapturedPieces } from "@/features/game/utils/get-captured-pieces"

const PIECE_VALUES: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
}

export type PieceCounts = Record<string, number>

export type MaterialState = {
    captured: {
        white: PieceCounts // pieces captured by white
        black: PieceCounts // pieces captured by black
    }
    advantage: {
        white: number
        black: number
        diff: number // positive = white ahead, negative = black ahead
    }
}

export function getMaterialState(fen: string): MaterialState {
    const captured = getCapturedPieces(fen)

    const sum = (pieces: PieceCounts) =>
        Object.entries(pieces).reduce(
            (acc, [piece, count]) => acc + (PIECE_VALUES[piece] ?? 0) * count,
            0,
        )

    const whiteMaterial = sum(captured.white)
    const blackMaterial = sum(captured.black)
    const diff = whiteMaterial - blackMaterial

    return {
        captured,
        advantage: {
            white: Math.max(0, diff),
            black: Math.max(0, -diff),
            diff,
        },
    }
}
