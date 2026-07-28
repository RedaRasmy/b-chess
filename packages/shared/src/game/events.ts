import { Game, IGame } from "../validation"
import { GameWithPlayers } from "./types"

export const CLIENT_EVENTS = {
    MOVE: "move",
    SYNC_GAME: "sync_game",
    JOIN_GAME: "join_game",
    JOIN_QUEUE: "join_queue",
    CANCEL_MATCH: "cancel_match",
} as const

export const SERVER_EVENTS = {
    EXCEPTION: "exception",
    GAME_FOUND: "game_found",
    NEW_MOVE: "new_move",
    CURRENT_STATE: "current_state",
    OPPONENT_STATUS_CHANGED: "opponent_status_changed",
    QUEUE_JOINED: "queue_joined",
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
    [SERVER_EVENTS.NEW_MOVE]: () => void
    [SERVER_EVENTS.CURRENT_STATE]: (game: GameWithPlayers) => void
    [SERVER_EVENTS.OPPONENT_STATUS_CHANGED]: (p: {
        status: "connected" | "disconnected"
    }) => void
    [SERVER_EVENTS.QUEUE_JOINED]: (p: { gameId: string }) => void
}

export type ClientToServerEvents = {
    [CLIENT_EVENTS.MOVE]: () => void
    [CLIENT_EVENTS.SYNC_GAME]: () => void
    [CLIENT_EVENTS.JOIN_GAME]: () => void
    [CLIENT_EVENTS.JOIN_QUEUE]: (p: IGame) => void
    [CLIENT_EVENTS.CANCEL_MATCH]: () => void
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
