import { Button } from "@/components/ui/button"
import GoogleIcon from "@/features/auth/components/google-icon"
import { authClient } from "@/lib/auth-client"

export default function GoogleButton() {
    async function handleClick() {
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
        await authClient.signIn.social({
            provider: "google",
            callbackURL: `${baseUrl}/profile`,
            errorCallbackURL: `${baseUrl}/auth/login`,
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
