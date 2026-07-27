import { Game, IGame } from "../validation"

export const CLIENT_EVENTS = {
    MOVE: "move",
    SYNC_GAME: "sync_game",
    JOIN_GAME: "join_game",
    JOIN_QUEUE: "join_queue",
} as const

export const SERVER_EVENTS = {
    GAME_FOUND: "game_found",
    NEW_MOVE: "new_move",
    CURRENT_STATE: "current_state",
    OPPONENT_STATUS_CHANGED: "opponent_status_changed",
} as const

export const SOCKET_EVENTS = {
    ...CLIENT_EVENTS,
    ...SERVER_EVENTS,
} as const

type ServerEvents = typeof SERVER_EVENTS
export type ServerEvent = ServerEvents[keyof ServerEvents]

type ClientEvents = typeof CLIENT_EVENTS
export type ClientEvent = ClientEvents[keyof ClientEvents]

//

export type ServerToClientEvents = {
    [SERVER_EVENTS.GAME_FOUND]: (p: { gameId: string }) => void
    [SERVER_EVENTS.NEW_MOVE]: () => void
    [SERVER_EVENTS.CURRENT_STATE]: (game: Game) => void
    [SERVER_EVENTS.OPPONENT_STATUS_CHANGED]: (p: {
        status: "connected" | "disconnected"
    }) => void
}

export type ClientToServerEvents = {
    [CLIENT_EVENTS.MOVE]: () => void
    [CLIENT_EVENTS.SYNC_GAME]: () => void
    [CLIENT_EVENTS.JOIN_GAME]: () => void
    [CLIENT_EVENTS.JOIN_QUEUE]: (p: IGame) => void
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
