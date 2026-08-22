'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchIsPlaying } from '@/features/multiplayer/requests';

export function AppBootstrap() {
    const router = useRouter();
    const pathname = usePathname();

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        (async () => {
            if (!pathname.startsWith(`/multiplayer/play`)) {
                const isPlaying = await fetchIsPlaying();
                if (isPlaying) {
                    router.replace(`/multiplayer/play`);
                }
            }
        })();
    }, []);

    return null;
}
