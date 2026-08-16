import { api } from '@/lib/api';
import { FullFinishedGame, FullPlayingGame } from '@bchess/shared';

export async function fetchGame(id: string) {
    const data = await api.get<FullPlayingGame | FullFinishedGame>(`/games/${id}`);

    return data.data;
}
