import { Reason, games, Result, PromotionPiece, moves } from "@bchess/db/tables"
import { Square } from "chess.js"
import { Merge, Prettify } from "../types"

export type ChessTimer = {
    type: "bullet" | "blitz" | "rapid"
    base: number
    plus: number
}

type Players = {
    white: { username: string; image: string | null }
    black: { username: string; image: string | null }
}

export type DrawRequest = {
    requestDraw: "w" | "b"
    requestedDrawAt: Date
}

export type PreparingGame = Merge<
    typeof games.$inferSelect,
    {
        status: "preparing"
        blackId: string
    }
>

export type PlayingGame = Merge<
    PreparingGame,
    {
        status: "playing"
        gameStartedAt: number
    }
>

export type FinishedGame = Merge<
    PlayingGame,
    {
        status: "finished"
        gameOverReason: Reason
        result: Result
    }
>

export type DrawingGame = Merge<PlayingGame, DrawRequest>

export type MatchedGame = PreparingGame | PlayingGame

export type MatchedGameWithPlayers = MatchedGame & Players

export type PlayingGameWithPlayers = PlayingGame & Players

export type DrawingGameWithPlayers = DrawingGame & Players

export type FinishedGameWithPlayers = FinishedGame & Players

export type GameWithPlayers = (MatchedGame | FinishedGame) & Players

export interface MoveType {
    from: Square
    to: Square
    promotion?: PromotionPiece
}

export type SMove = typeof moves.$inferInsert

export type FullGame = Prettify<GameWithPlayers & { moves: MoveType[] }>

export type GameTimestamps = {
    whiteTimeLeft: number
    blackTimeLeft: number
    gameStartedAt: number
    lastMoveAt: number | null
}
