import { api } from '@/lib/api';
import { GameSummary, Stats } from '@bchess/shared';

export async function fetchStats() {
    return (await api.get<Stats>('/profile/stats')).data;
}

export async function fetchGames() {
    return (await api.get<GameSummary[]>('/profile/games')).data;
}
