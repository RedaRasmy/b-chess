import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [usernameClient()],
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
})
