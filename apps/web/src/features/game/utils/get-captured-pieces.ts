import { Chess } from "chess.js"

const STARTING_COUNTS: Record<string, number> = {
    p: 8, n: 2, b: 2, r: 2, q: 1, // black pieces
    P: 8, N: 2, B: 2, R: 2, Q: 1, // white pieces
}

export function getCapturedPieces(fen: string) {
    const chess = new Chess(fen)
    const board = chess.board().flat()

    const remaining: Record<string, number> = {}
    for (const square of board) {
        if (!square) continue
        const key = square.color === "w" 
            ? square.type.toUpperCase() 
            : square.type
        remaining[key] = (remaining[key] ?? 0) + 1
    }

    const captured = { white: {} as Record<string, number>, black: {} as Record<string, number> }

    for (const [piece, start] of Object.entries(STARTING_COUNTS)) {
        const diff = start - (remaining[piece] ?? 0)
        if (diff > 0) {
            // uppercase = white piece captured by black
            // lowercase = black piece captured by white
            const capturedBy = piece === piece.toUpperCase() ? "black" : "white"
            captured[capturedBy][piece.toLowerCase()] = diff
        }
    }

    return captured
}