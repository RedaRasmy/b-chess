import { Button } from "@/components/ui/button"
import GithubIcon from "@/features/auth/components/github-icon"
import { authClient } from "@/lib/auth-client"

export default function GithubButton() {
    async function handleClick() {
        await authClient.signIn.social({
            provider: "github",
            callbackURL: "/profile",
            errorCallbackURL: "/auth/login",
        })
    }
    return (
        <Button
            variant="secondary"
            className="w-full cursor-pointer"
            onClick={handleClick}
        >
            <GithubIcon />
            Github
        </Button>
    )
}
