import { Button } from '@/components/ui/button';
import GithubIcon from '@/features/auth/components/github-icon';
import { authClient } from '@/lib/auth-client';

export default function GithubButton() {
    async function handleClick() {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        await authClient.signIn.social({
            provider: 'github',
            callbackURL: `${baseUrl}/profile`,
            errorCallbackURL: `${baseUrl}/auth/login`,
        });
    }
    return (
        <Button variant="secondary" className="w-full cursor-pointer" onClick={handleClick}>
            <GithubIcon />
            Github
        </Button>
    );
}
