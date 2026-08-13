import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { username } from 'better-auth/plugins';
import { db } from '@bchess/db';
import { userStats } from '@bchess/db/tables';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),
    trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3333',

    //
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [
        username({
            minUsernameLength: 3,
            maxUsernameLength: 15,
        }),
    ],

    // Hooks
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await db.insert(userStats).values({
                        userId: user.id,
                    });
                },
            },
        },
    },

    // Rate limiting
    rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        customRules: {
            '/sign-in/email': { window: 60, max: 5 }, // stricter: brute-force protection
            '/sign-up/email': { window: 3600, max: 3 }, // very strict: bot protection
            '/forget-password': { window: 300, max: 3 },
        },
    },
});
