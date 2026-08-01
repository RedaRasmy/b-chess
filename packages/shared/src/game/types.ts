import {
    Reason,
    games,
    PromotionPiece,
    moves,
    TimerOption,
    userStats,
    Status,
} from "@bchess/db/tables"
import { Square } from "chess.js"
import { Narrow, Prettify, Update } from "../types"

export type ChessTimer = {
    type: "bullet" | "blitz" | "rapid"
    base: number
    plus: number
}

export type DrawReason = Extract<
    Reason,
    | "Fifty moves rule"
    | "Insufficient material"
    | "Stalemate"
    | "Threefold repetition"
    | "Agreement"
>

export type WinLossReason = Extract<
    Reason,
    "Checkmate" | "Timeout" | "Resignation"
>

export type Stats = typeof userStats.$inferSelect

type Players = {
    white: { username: string; image: string | null }
    black: { username: string; image: string | null }
}

export type DrawRequest = {
    requestDraw: "w" | "b"
    requestedDrawAt: Date
}

type SGame = typeof games.$inferSelect

export type PreparingGame = Narrow<
    SGame,
    {
        status: "preparing"
        blackId: string
        blackRating: number
    }
>

export type PlayingGame = Update<
    PreparingGame,
    {
        status: "playing"
        gameStartedAt: number
    }
>

export type EndCase =
    | {
          result: "draw"
          reason: DrawReason
      }
    | {
          result: "white_won" | "black_won"
          reason: WinLossReason
      }

export type EndState = Prettify<
    {
        status: "finished"
        whiteEloDiff: number
        blackEloDiff: number
    } & EndCase
>

export type NotEndState = {
    status: Exclude<Status, "finished">
    whiteEloDiff: null
    blackEloDiff: null
    reason: null
    result: null
}

export type FinishedGame = Update<PlayingGame, EndState>

export type DrawingGame = Narrow<PlayingGame, DrawRequest>

export type MatchedGame = PreparingGame | PlayingGame

export type MatchedGameWithPlayers = MatchedGame & Players

export type PlayingGameWithPlayers = PlayingGame & Players

export type DrawingGameWithPlayers = DrawingGame & Players

export type FinishedGameWithPlayers = FinishedGame & Players

export type GameWithPlayers = MatchedGameWithPlayers | FinishedGameWithPlayers

export interface MoveType {
    from: Square
    to: Square
    promotion?: PromotionPiece
}

export type SMove = typeof moves.$inferSelect

export type FullGame = Prettify<GameWithPlayers & { moves: MoveType[] }>

export type GameTimestamps = {
    whiteTimeLeft: number
    blackTimeLeft: number
    gameStartedAt: number
    lastMoveAt: number | null
}

export type GameSummary = {
    id: string
    opponent: {
        id: string
        username: string
        avatar: string | null
    }
    result: "win" | "loss" | "draw"
    duration: number
    reason: Reason
    timer: TimerOption
    ratingDiff: number
}
