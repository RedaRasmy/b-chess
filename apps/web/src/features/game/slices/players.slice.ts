import { GameSlice, PlayersSlice } from '@/features/game/types';

export const playersSlice: GameSlice<PlayersSlice> = (set, get) => ({
    players: null,

    setPlayers: ({ white, black, playerColor }) => {
        set({
            players: {
                white,
                black,
                playerColor,
            },
            status: 'preparing',
        });
    },

    setPlayerStatus: (color, status) => {
        const { players } = get();
        if (!players) return;

        const isWhite = color === 'w';
        const isBlack = (color = 'b');

        set({
            players: {
                ...players,
                white: {
                    ...players.white,
                    status: isWhite ? status : players.white.status,
                },
                black: {
                    ...players.black,
                    status: isBlack ? status : players.black.status,
                },
            },
        });
    },

    resetPlayers: () => {
        set({
            players: null,
        });
    },
});
