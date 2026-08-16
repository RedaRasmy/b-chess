'use client';
import LoadingPage from '@/components/loading-page';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
    const { isPending, data: session } = authClient.useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending) {
            if (!session) {
                router.replace('/auth/login');
            } else if (session.user.username) {
                router.replace('/profile');
            }
        }
    }, [isPending, session]);

    if (isPending) return <LoadingPage />;
    if (!session) return null;

    return children;
}
