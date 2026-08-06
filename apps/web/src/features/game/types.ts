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
import { StateCreator } from "zustand"

export type GameMode = "bot" | "multiplayer" | "idle"

export interface PlayerInfo {
    id: string
    username: string
    avatar: string | null
    rating?: number
    status: PlayerStatus | null
}

export interface Clock {
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

type Results = {
    result: Result
    reason: Reason
    whiteEloDiff: number | null
    blackEloDiff: number | null
}

// Players Slice

export type PlayersState = {
    players: {
        white: PlayerInfo
        black: PlayerInfo
        playerColor: ColorName
    } | null
}

export type PlayersActions = {
    setPlayers: (payload: {
        white: PlayerInfo
        black: PlayerInfo
        playerColor: ColorName
    }) => void

    setPlayerStatus: (color: Color, status: PlayerStatus | null) => void
}

export type PlayersSlice = PlayersState & PlayersActions

// Clock Slice

export type ClockState = {
    clock: Clock | null
}

export type ClockActions = {
    setClock: (clock: Clock) => void
    startClock: (timeControl?: {
        initial: number
        increment: number
        lastTickAt?: number
    }) => void

    stopClock(p: { reason: Reason; result: Result }): void

    switchClock(): void

    rollbackClock(timetamps: GameTimestamps): void
}

export type ClockSlice = ClockState & ClockActions

export type OldState = {
    // metadata
    mode: GameMode
    lastAction: null | Action

    // core
    chess: Chess
    fen: string
    status: Status
    moveHistory: Move[]

    // display
    viewIndex: number | null
    displayFen: string
    selectedSquare: Square | null
    legalMoves: Square[]

    // results
    results: Results | null
}

export type GameState = PlayersState & ClockState & OldState

export type OldActions = {
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
    goToMove: (index: number) => void
    goToStart: () => void
    goToEnd: () => void
    stepBack: () => void
    stepForward: () => void
    undo: () => void
    rollback: (timestamps: GameTimestamps) => void
    syncGame: (game: SyncGame, playerColor: ColorName) => void
}
export type GameActions = PlayersActions & ClockActions & OldActions

export type GameStore = GameState & GameActions

export type GameSlice<T> = StateCreator<GameStore, [], [], T>
