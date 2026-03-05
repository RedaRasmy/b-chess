import { Button } from "@/components/ui/button"
import GoogleIcon from "@/features/auth/components/google-icon"
import { authClient } from "@/lib/auth-client"

export default function GoogleButton() {
    async function handleClick() {
        await authClient.signIn.social({
            provider: "google",
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
            <GoogleIcon />
            Google
        </Button>
    )
}
