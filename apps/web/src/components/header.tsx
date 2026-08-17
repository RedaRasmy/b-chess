'use client';
import { Button } from './ui/button';
import { SidebarTrigger } from './ui/sidebar';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import ConnectionButton from '@/features/multiplayer/components/connection-button';
import { useEffect, useState } from 'react';

export default function Header() {
    const [mounted, setMounted] = useState(false);
    const { isPending, data: session } = authClient.useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    const showLogin = mounted && !isPending && !session;

    return (
        <div className="min-h-10 flex items-center pl-2 pr-4 justify-between sticky py-3">
            <SidebarTrigger />
            <div className="flex gap-2 md:gap-4">
                <ConnectionButton />
                {showLogin && (
                    <Button asChild>
                        <Link href={'/auth/login'}>Sign in</Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
