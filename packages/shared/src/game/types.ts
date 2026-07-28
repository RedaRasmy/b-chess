import { games } from "@bchess/db/tables"

export type ChessTimer = {
    type: "bullet" | "blitz" | "rapid"
    base: number
    plus: number
}

type Players = {
    white: { username: string; image: string | null }
    black: { username: string; image: string | null }
}

export type OngoingGame = Omit<
    typeof games.$inferSelect,
    "status" | "blackId" | "gameStartedAt"
> & {
    status: "preparing" | "playing"
    blackId: string
    gameStartedAt: number
}

export type OngoingGameWithPlayers = OngoingGame & Players

export type FinishedGame = Omit<OngoingGame, "status"> & {
    status: "finished"
}

export type FinishedGameWithPlayers = FinishedGame & Players

export type GameWithPlayers = OngoingGameWithPlayers | FinishedGameWithPlayers
