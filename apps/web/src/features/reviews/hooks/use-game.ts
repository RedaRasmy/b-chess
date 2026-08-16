import { fetchGame } from '@/features/reviews/requests';
import { useQuery } from '@tanstack/react-query';

export function useGame(id: string) {
    return useQuery({
        queryKey: ['game-review'],
        queryFn: () => fetchGame(id),
    });
}
