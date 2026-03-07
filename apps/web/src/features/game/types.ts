import { Chess, Move, Square } from "chess.js"

export type GameMode = "bot" | "multiplayer" | "idle"
export type GameStatus = "waiting" | "playing" | "paused" | "finished"
export type GameResult = "white" | "black" | "draw" | null
export type GameEndReason =
    | "checkmate"
    | "resignation"
    | "timeout"
    | "draw_agreement"
    | "stalemate"
    | "insufficient_material"
    | "threefold_repetition"
    | null

export type PieceColor = "white" | "black"

export interface PlayerInfo {
    id: string
    username: string
    // rating: number
    avatar?: string
}

export interface ClockState {
    white: number
    black: number
    increment: number
    activeColor: PieceColor | null
    lastTickAt: number | null
}

export type PromotionPiece = "q" | "r" | "b" | "n"

export interface LastMove {
    from: Square
    to: Square
    promotion?: PromotionPiece
}

export type CapturedPiece = "p" | "n" | "b" | "r" | "q"

export interface CapturedPieces {
    white: CapturedPiece[]
    black: CapturedPiece[]
}

export interface GameState {
    // core
    chess: Chess
    fen: string
    mode: GameMode
    status: GameStatus

    // players
    playerColor: PieceColor | null
    white: PlayerInfo | null
    black: PlayerInfo | null

    // moves
    moveHistory: Move[]
    lastMove: LastMove | null
    viewIndex: number | null
    displayFen: string

    // selection
    selectedSquare: Square | null
    legalMoves: Square[]

    // result
    result: GameResult
    endReason: GameEndReason

    // clock
    clock: ClockState | null

    // actions
    selectSquare: (square: Square) => void
    makeMove: (from: Square, to: Square, promotion?: string) => Move | null
    setPosition: (fen: string) => void
    resetGame: () => void
    setPlayers: (white: PlayerInfo, black: PlayerInfo) => void
    setPlayerColor: (color: PieceColor) => void
    setStatus: (status: GameStatus) => void
    setMode: (mode: GameMode) => void
    endGame: (result: GameResult, reason: GameEndReason) => void
    startClock: (timeControl?: { initial: number; increment: number }) => void
    pauseClock: () => void
    goToMove: (index: number) => void
    goToStart: () => void
    goToEnd: () => void
    stepBack: () => void
    stepForward: () => void
    undo: () => void
}

export type ChessTimer = {
    type: "bullet" | "blitz" | "rapid"
    base: number
    plus: number
}

export const TIMER_OPTIONS = [
    "bullet 1+0",
    "bullet 2+1",
    "blitz 3+0",
    "blitz 3+2",
    "blitz 5+0",
    "blitz 5+3",
    "rapid 10+0",
    "rapid 10+5",
    "rapid 15+10",
] as const

export type TimerOption = (typeof TIMER_OPTIONS)[number]
