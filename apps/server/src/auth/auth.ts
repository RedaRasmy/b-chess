import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { username } from 'better-auth/plugins';
import { db } from '@bchess/db';
import { userStats } from '@bchess/db/tables';
import { MailService } from '../mail/mail.service';
import { createAuthMiddleware } from 'better-auth/api';
import { passkey } from '@better-auth/passkey';
import { ResignService } from '../multiplayer/resign.service';
import { MatchmakingService } from '../multiplayer/matchmaking.service';

export const createAuth = ({
    mail,
    resignService,
    matchmakingService,
}: {
    mail: MailService;
    resignService: ResignService;
    matchmakingService: MatchmakingService;
}) =>
    betterAuth({
        database: drizzleAdapter(db, {
            provider: 'pg',
        }),
        trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
        baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3333',

        user: {
            deleteUser: {
                enabled: true,
                sendDeleteAccountVerification: async ({ user, url }) => {
                    await mail.sendDeleteAccount(user.email, url);
                },
                deleteTokenExpiresIn: 60 * 15, // 15min
                beforeDelete: async (user) => {
                    await matchmakingService.cancelMatch(user.id);
                    // Note: Resign -> Emit, so the gateway can notify the opponent
                    await resignService.resignAndEmit(user.id);
                },
            },
        },
        session: {
            freshAge: 0, // 0 == disabled, I'm using email verification on account deletion
        },
        //
        emailAndPassword: {
            enabled: true,
            revokeSessionsOnPasswordReset: true,
            resetPasswordTokenExpiresIn: 60 * 30, // 30min
            sendResetPassword: async ({ user, url }) => {
                await mail.sendResetPassword(user.email, url);
            },
            onPasswordReset: async ({ user }) => {
                await mail.sendPasswordChanged(user.email);
            },
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
            passkey({
                rpID: process.env.DOMAIN || 'localhost',
                rpName: 'BChess',
                origin: process.env.FRONTEND_URL,
            }),
        ],

        databaseHooks: {
            user: {
                create: {
                    after: async (user) => {
                        await db.insert(userStats).values({
                            userId: user.id,
                        });
                        await mail.sendWelcome(user.email);
                    },
                },
            },
        },

        hooks: {
            after: createAuthMiddleware(async (ctx) => {
                if (ctx.path !== '/change-password') return;

                const returned = ctx.context.returned as { user?: { email: string } } | undefined;
                const email = returned?.user?.email;
                if (!email) return;

                await mail.sendPasswordChanged(email).catch(console.error);
            }),
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

export type Auth = ReturnType<typeof createAuth>;
