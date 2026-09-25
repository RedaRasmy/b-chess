import { Button } from '@/components/ui/button';
import GoogleIcon from '@/features/auth/components/google-icon';
import LastUsedBadge from '@/features/auth/components/last-used-badge';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export default function GoogleButton({
    isLastUsed = false,
    className,
}: {
    isLastUsed?: boolean;
    className?: string;
}) {
    async function handleClick() {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        await authClient.signIn.social({
            provider: 'google',
            callbackURL: `${baseUrl}/profile`,
            errorCallbackURL: `${baseUrl}/auth/login`,
        });
    }
    return (
        <Button
            variant="secondary"
            className={cn('relative w-full', className)}
            onClick={handleClick}
        >
            <GoogleIcon />
            Google
            {isLastUsed && <LastUsedBadge />}
        </Button>
    );
}
