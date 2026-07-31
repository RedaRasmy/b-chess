import { Game, IGame } from "../validation"
import {
    DrawRequest,
    FinishedGame,
    FullGame,
    GameTimestamps,
    GameWithPlayers,
    MoveType,
    SMove,
} from "./types"

export const CLIENT_EVENTS = {
    MOVE: "move",
    JOIN_GAME: "join_game",
    JOIN_QUEUE: "join_queue",
    CANCEL_MATCH: "cancel_match",
    RESIGN: "resign",
    TIMEOUT: "timeout",
    RQUEST_DRAW: "request_draw",
    ACCEPT_DRAW: "accept_draw",
    REJECT_DRAW: "reject_draw",
} as const

export const SERVER_EVENTS = {
    EXCEPTION: "exception",
    GAME_FOUND: "game_found",
    NEW_MOVE: "new_move",
    OPPONENT_STATUS_CHANGED: "opponent_status_changed",
    QUEUE_JOINED: "queue_joined",
    DRAW_REQUEST: "draw_request",
    SYNC: "sync",
    GAME_FINISHED: "game_finished",
} as const

export const SOCKET_EVENTS = {
    ...CLIENT_EVENTS,
    ...SERVER_EVENTS,
} as const

type ServerEvents = typeof SERVER_EVENTS
export type ServerEvent = ServerEvents[keyof ServerEvents]

type ClientEvents = typeof CLIENT_EVENTS
export type ClientEvent = ClientEvents[keyof ClientEvents]

export type ServerToClientEvents = {
    [SERVER_EVENTS.EXCEPTION]: (payload: {
        status?: string
        message: string
        code?: string
    }) => void
    ///
    [SERVER_EVENTS.GAME_FOUND]: (p: Game) => void
    [SERVER_EVENTS.NEW_MOVE]: (move: SMove) => void
    [SERVER_EVENTS.SYNC]: (game: FullGame) => void
    [SERVER_EVENTS.OPPONENT_STATUS_CHANGED]: (p: {
        status: "connected" | "disconnected"
    }) => void
    [SERVER_EVENTS.QUEUE_JOINED]: (p: { gameId: string }) => void
    [SERVER_EVENTS.DRAW_REQUEST]: (p: DrawRequest) => void
    [SERVER_EVENTS.GAME_FINISHED]: (p: FinishedGame) => void
}

export type MoveAck = (
    result:
        | {
              status: "success"
              timestamps: GameTimestamps
          }
        | {
              status: "error"
              error?: unknown
              timestamps: GameTimestamps
          },
) => void

export type ClientToServerEvents = {
    [CLIENT_EVENTS.MOVE]: (p: MoveType, callback: MoveAck) => void
    [CLIENT_EVENTS.JOIN_GAME]: () => void
    [CLIENT_EVENTS.JOIN_QUEUE]: (p: IGame) => void
    [CLIENT_EVENTS.CANCEL_MATCH]: () => void
    [CLIENT_EVENTS.RESIGN]: () => void
    [CLIENT_EVENTS.TIMEOUT]: () => void
    [CLIENT_EVENTS.RQUEST_DRAW]: () => void
    [CLIENT_EVENTS.ACCEPT_DRAW]: () => void
    [CLIENT_EVENTS.REJECT_DRAW]: () => void
}

// Utility Types

export type Args<E extends ServerEvent | ClientEvent> = E extends ServerEvent
    ? Parameters<ServerToClientEvents[E]>
    : E extends ClientEvent
      ? Parameters<ClientToServerEvents[E]>
      : never

export type Payload<E extends ServerEvent | ClientEvent> = E extends ServerEvent
    ? ServerToClientEvents[E] extends (arg: infer P, ...args: any[]) => any
        ? P
        : never
    : E extends ClientEvent
      ? ClientToServerEvents[E] extends (arg: infer P, ...args: any[]) => any
          ? P
          : never
      : never

export type Callback<E extends ServerEvent | ClientEvent> =
    E extends ServerEvent
        ? ServerToClientEvents[E] extends (...args: infer Args) => any
            ? Args extends [...any[], infer C]
                ? C extends (...args: any[]) => any
                    ? C
                    : never
                : never
            : never
        : E extends ClientEvent
          ? ClientToServerEvents[E] extends (...args: infer Args) => any
              ? Args extends [...any[], infer C]
                  ? C extends (...args: any[]) => any
                      ? C
                      : never
                  : never
              : never
          : never
