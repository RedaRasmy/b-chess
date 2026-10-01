import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';

export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: () => authClient.listAccounts(),
    });
}
