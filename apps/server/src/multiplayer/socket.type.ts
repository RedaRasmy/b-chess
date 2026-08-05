import { ClientToServerEvents, ServerToClientEvents } from '@bchess/shared';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { DefaultEventsMap, Server, Socket } from 'socket.io';

type Data = {
    user: UserSession['user'];
    currentGame: {
        id: string;
        playerColor: 'w' | 'b';
    } | null;
};

export type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    Data
>;

export type TypedServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    Data
>;
