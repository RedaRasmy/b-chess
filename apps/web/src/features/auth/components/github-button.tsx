import { Button } from '@/components/ui/button';
import GithubIcon from '@/features/auth/components/github-icon';
import LastUsedBadge from '@/features/auth/components/last-used-badge';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export default function GithubButton({
    isLastUsed = false,
    className,
}: {
    isLastUsed?: boolean;
    className?: string;
}) {
    async function handleClick() {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        await authClient.signIn.social({
            provider: 'github',
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
            <GithubIcon />
            Github
            {isLastUsed && <LastUsedBadge />}
        </Button>
    );
}
