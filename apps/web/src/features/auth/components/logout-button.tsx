'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LogoutButton({
    className,
    variant = 'destructive',
    size,
    onlyIcon = false,
    responsive = false,
}: {
    className?: string;
    onlyIcon?: boolean;
    responsive?: boolean;
} & VariantProps<typeof buttonVariants>) {
    const router = useRouter();

    async function handleLogout() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => router.replace('/auth/login'),
            },
        });
    }

    return (
        <Button
            variant={onlyIcon ? 'outline' : variant}
            size={onlyIcon ? 'icon' : size}
            className={cn('cursor-pointer flex gap-2 items-center justify-center', className)}
            onClick={handleLogout}
        >
            <>
                <LogOut size={16} color="red" />
                {responsive && !onlyIcon && <span className="hidden sm:block">log out</span>}
                {!responsive && !onlyIcon && 'log out'}
            </>
        </Button>
    );
}
