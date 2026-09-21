import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';

export const authClient = createAuthClient({
    plugins: [usernameClient(), passkeyClient()],
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
});

export type Session = typeof authClient.$Infer.Session;
