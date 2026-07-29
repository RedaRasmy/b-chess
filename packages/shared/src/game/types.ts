import { Reason, games, Result, PromotionPiece, moves } from "@bchess/db/tables"
import { Square } from "chess.js"

export type ChessTimer = {
    type: "bullet" | "blitz" | "rapid"
    base: number
    plus: number
}

type Players = {
    white: { username: string; image: string | null }
    black: { username: string; image: string | null }
}

export type PreparingGame = Omit<
    typeof games.$inferSelect,
    "status" | "blackId"
> & {
    status: "preparing"
    blackId: string
}

export type PlayingGame = Omit<PreparingGame, "status" | "gameStartedAt"> & {
    status: "playing"
    gameStartedAt: number
}

export type MatchedGame = PreparingGame | PlayingGame

export type MatchedGameWithPlayers = MatchedGame & Players

export type PlayingGameWithPlayers = PlayingGame & Players

export type FinishedGame = Omit<
    PlayingGame,
    "status" | "gameOverReason" | "result"
> & {
    status: "finished"
    gameOverReason: Reason
    result: Result
}

export type FinishedGameWithPlayers = FinishedGame & Players

export type GameWithPlayers = (MatchedGame | FinishedGame) & Players

export interface MoveType {
    from: Square
    to: Square
    promotion?: PromotionPiece
}

export type SMove = typeof moves.$inferInsert

export type GameTimestamps = {
    whiteTimeLeft: number
    blackTimeLeft: number
    gameStartedAt: number
    lastMoveAt: number | null
}
