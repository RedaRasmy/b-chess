import {
    Result,
    Status,
    Reason,
    MoveType,
    GameTimestamps,
    FullGame,
    PlayerStatus,
    ColorName,
    SyncGame,
} from "@bchess/shared"
import { Chess, Color, Move, Square } from "chess.js"

export type GameMode = "bot" | "multiplayer" | "idle"

export interface PlayerInfo {
    id: string
    username: string
    rating?: number
    avatar: string | null
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
    // core
    chess: Chess
    fen: string
    mode: GameMode
    status: Status
    lastAction: null | Action

    // players
    playerColor: ColorName | null
    white: PlayerInfo | null
    black: PlayerInfo | null
    whiteEloDiff: number | null
    blackEloDiff: number | null
    whiteStatus: PlayerStatus | null
    blackStatus: PlayerStatus | null

    // moves
    moveHistory: Move[]
    lastMove: MoveType | null
    viewIndex: number | null
    displayFen: string

    // selection
    selectedSquare: Square | null
    legalMoves: Square[]

    // result
    result: Result | null
    endReason: Reason | null

    // clock
    clock: ClockState | null

    // actions
    selectSquare: (square: Square) => void
    makeMove: (
        from: string,
        to: string,
        promotion?: string,
        ack?: boolean,
    ) => Move | null
    setPosition: (fen: string) => void
    resetGame: () => void
    setPlayers: (white: PlayerInfo, black: PlayerInfo) => void
    setPlayerColor: (color: ColorName) => void
    setStatus: (status: Status) => void
    setMode: (mode: GameMode) => void
    endGame: (
        result: Result,
        reason: Reason,
        elo?: {
            whiteEloDiff: number
            blackEloDiff: number
        },
    ) => void
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
