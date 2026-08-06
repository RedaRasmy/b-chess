import {
    Result,
    Status,
    Reason,
    MoveType,
    GameTimestamps,
    PlayerStatus,
    ColorName,
    SyncGame,
} from "@bchess/shared"
import { Chess, Color, Move, Square } from "chess.js"

export type GameMode = "bot" | "multiplayer" | "idle"

export interface PlayerInfo {
    id: string
    username: string
    avatar: string | null
    rating?: number
    status: PlayerStatus | null
}

export interface ClockState {
    white: number
    black: number
    increment: number
    activeColor: ColorName | null
    lastTickAt: number | null
}

export type CapturedPiece = "p" | "n" | "b" | "r" | "q"

export interface CapturedPieces {
    white: CapturedPiece[]
    black: CapturedPiece[]
}

type Action =
    | {
          type: "move"
          move: MoveType
      }
    | {
          type: "timeout"
      }

export interface GameState {
    // metadata
    mode: GameMode
    lastAction: null | Action

    // core
    chess: Chess
    fen: string
    status: Status
    moveHistory: Move[]
    playerColor: ColorName | null

    // display
    viewIndex: number | null
    displayFen: string
    selectedSquare: Square | null
    legalMoves: Square[]

    // players
    white: PlayerInfo | null
    black: PlayerInfo | null

    // results
    whiteEloDiff: number | null
    blackEloDiff: number | null
    result: Result | null
    endReason: Reason | null

    // clock
    clock: ClockState | null
}

export interface GameActions {
    selectSquare: (square: Square) => void
    makeMove: (payload: {
        from: string
        to: string
        promotion?: string
        ack?: boolean
        withSound?: boolean
        updateClock?: boolean
    }) => Move | null
    setPosition: (fen: string) => void
    resetGame: () => void
    setPlayers: (white: PlayerInfo, black: PlayerInfo) => void
    setPlayerColor: (color: ColorName) => void
    setStatus: (status: Status) => void
    setMode: (mode: GameMode) => void
    endGame: (payload: {
        result: Result
        reason: Reason
        elo?: {
            whiteEloDiff: number
            blackEloDiff: number
        }
        withSound?: boolean
    }) => void
    startClock: (timeControl?: {
        initial: number
        increment: number
        lastTickAt?: number
    }) => void
    pauseClock: () => void
    goToMove: (index: number) => void
    goToStart: () => void
    goToEnd: () => void
    stepBack: () => void
    stepForward: () => void
    undo: () => void
    rollback: (timestamps: GameTimestamps) => void
    syncTimer: (game: GameTimestamps) => void
    syncGame: (game: SyncGame, playerColor: ColorName) => void
    setPlayerStatus: (color: Color, status: PlayerStatus | null) => void
}

export type GameStore = GameState & GameActions
