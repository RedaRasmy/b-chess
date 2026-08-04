export const Rooms = {
    game: (gameId: string) => `game:${gameId}`,
    user: (userId: string) => `user:${userId}`,
    users: (userId1: string, userId2: string) => [
        `user:${userId1}`,
        `user:${userId2}`,
    ],
    // spectators: (gameId: string) => `game:${gameId}:spectators`,
};
