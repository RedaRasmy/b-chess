import { GameSlice, ResultsSlice } from '@/features/game/types';
import { playSound } from '@/lib/sounds';

export const resultsSlice: GameSlice<ResultsSlice> = (set, get) => ({
    results: null,

    endGame: ({ result, reason, elo, withSound = true }) => {
        const lastActionWrapper =
            reason === 'Timeout'
                ? {
                      lastAction: {
                          type: 'timeout' as const,
                      },
                  }
                : {};

        get().stopClock({ reason, result });

        set({
            status: 'finished',
            results: {
                result,
                reason,
                whiteEloDiff: elo?.whiteEloDiff ?? null,
                blackEloDiff: elo?.blackEloDiff ?? null,
            },
            ...lastActionWrapper,
        });

        if (withSound) {
            playSound('gameEnd');
        }
    },

    resetResults() {
        set({
            results: null,
        });
    },
});
