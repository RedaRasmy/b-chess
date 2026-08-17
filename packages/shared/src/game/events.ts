import { Game, IGame } from '../validation';
import { Reason, Result } from './constants';
import { DrawRequest, SyncGame, GameTimestamps, MoveType, SMove } from './types';
import { Elo } from './utils';

export const CLIENT_EVENTS = {
    MOVE: 'move',
    JOIN_GAME: 'join_game',
    JOIN_QUEUE: 'join_queue',
    CANCEL_MATCH: 'cancel_match',
    RESIGN: 'resign',
    TIMEOUT: 'timeout',
    RQUEST_DRAW: 'request_draw',
    ACCEPT_DRAW: 'accept_draw',
    REJECT_DRAW: 'reject_draw',
} as const;

export const SERVER_EVENTS = {
    EXCEPTION: 'exception',
    GAME_FOUND: 'game_found',
    NEW_MOVE: 'new_move',
    PLAYER_STATUS_CHANGED: 'player_status_changed',
    QUEUE_JOINED: 'queue_joined',
    DRAW_REQUEST: 'draw_request',
    SYNC: 'sync',
    GAME_FINISHED: 'game_finished',
} as const;

export const SOCKET_EVENTS = {
    ...CLIENT_EVENTS,
    ...SERVER_EVENTS,
} as const;

type ServerEvents = typeof SERVER_EVENTS;
export type ServerEvent = ServerEvents[keyof ServerEvents];

type ClientEvents = typeof CLIENT_EVENTS;
export type ClientEvent = ClientEvents[keyof ClientEvents];

export type ServerToClientEvents = {
    [SERVER_EVENTS.EXCEPTION]: (payload: {
        status?: string;
        message: string;
        code?: string;
    }) => void;
    ///
    [SERVER_EVENTS.GAME_FOUND]: (p: Game) => void;
    [SERVER_EVENTS.NEW_MOVE]: (move: SMove) => void;
    [SERVER_EVENTS.SYNC]: (game: SyncGame) => void;
    [SERVER_EVENTS.PLAYER_STATUS_CHANGED]: (p: {
        status: 'connected' | 'disconnected';
        color: 'w' | 'b';
    }) => void;
    [SERVER_EVENTS.QUEUE_JOINED]: (p: { gameId: string }) => void;
    [SERVER_EVENTS.DRAW_REQUEST]: (p: DrawRequest) => void;
    [SERVER_EVENTS.GAME_FINISHED]: (
        p: {
            result: Result;
            reason: Reason;
        } & Elo,
    ) => void;
};

export type MoveAck = (
    result:
        | {
              status: 'success';
              timestamps: GameTimestamps;
          }
        | {
              status: 'error';
              error?: unknown;
              timestamps: GameTimestamps;
          },
) => void;

export type ClientToServerEvents = {
    [CLIENT_EVENTS.MOVE]: (p: MoveType, callback: MoveAck) => void;
    [CLIENT_EVENTS.JOIN_GAME]: () => void;
    [CLIENT_EVENTS.JOIN_QUEUE]: (p: IGame) => void;
    [CLIENT_EVENTS.CANCEL_MATCH]: () => void;
    [CLIENT_EVENTS.RESIGN]: () => void;
    [CLIENT_EVENTS.TIMEOUT]: () => void;
    [CLIENT_EVENTS.RQUEST_DRAW]: () => void;
    [CLIENT_EVENTS.ACCEPT_DRAW]: () => void;
    [CLIENT_EVENTS.REJECT_DRAW]: () => void;
};
