import { fetchStats } from '@/features/profile/requests';
import { useQuery } from '@tanstack/react-query';

export default function useStats() {
    return useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
    });
}
