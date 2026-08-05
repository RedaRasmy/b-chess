import { TypedServer } from './socket.type';

export const Rooms = {
    game: (gameId: string) => `game:${gameId}`,
    user: (userId: string) => `user:${userId}`,
    users: (userId1: string, userId2: string) => [
        `user:${userId1}`,
        `user:${userId2}`,
    ],
    // spectators: (gameId: string) => `game:${gameId}:spectators`,
};

export async function isConnected(server: TypedServer, userId: string) {
    const sockets = await server.in(Rooms.user(userId)).fetchSockets();
    return sockets.length > 0;
}
