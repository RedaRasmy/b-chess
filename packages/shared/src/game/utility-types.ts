/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientEvent, ClientToServerEvents, ServerEvent, ServerToClientEvents } from './events';

export type Args<E extends ServerEvent | ClientEvent> = E extends ServerEvent
    ? Parameters<ServerToClientEvents[E]>
    : E extends ClientEvent
      ? Parameters<ClientToServerEvents[E]>
      : never;

export type Payload<E extends ServerEvent | ClientEvent> = E extends ServerEvent
    ? ServerToClientEvents[E] extends (arg: infer P, ...args: any[]) => any
        ? P
        : never
    : E extends ClientEvent
      ? ClientToServerEvents[E] extends (arg: infer P, ...args: any[]) => any
          ? P
          : never
      : never;

export type Callback<E extends ServerEvent | ClientEvent> = E extends ServerEvent
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
      : never;
