import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { type Database } from '@bchess/db';
import { games, userStats } from '@bchess/db/tables';
import { GameSummary } from '@bchess/shared';

export type GameResult = 'WIN' | 'LOSS' | 'DRAW';

@Injectable()
export class ProfileService {
    constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

    async getStats(session: UserSession) {
        const userId = session.user.id;

        let stats = await this.db.query.userStats.findFirst({
            where: eq(userStats.userId, userId),
        });

        // in case the db hook failed during sign-up
        if (!stats) {
            [stats] = await this.db
                .insert(userStats)
                .values({ userId })
                .onConflictDoNothing()
                .returning();

            if (!stats) {
                stats = await this.db.query.userStats.findFirst({
                    where: eq(userStats.userId, userId),
                });
            }
        }

        return stats;
    }

    // TODO: Refactor ( it should be better -> use it in multiplayer)
    async recordGameResult(userId: string, result: GameResult) {
        const winIncrement = result === 'WIN' ? 1 : 0;
        const lossIncrement = result === 'LOSS' ? 1 : 0;
        const drawIncrement = result === 'DRAW' ? 1 : 0;

        const [updatedStats] = await this.db
            .update(userStats)
            .set({
                wins: sql`${userStats.wins} + ${winIncrement}`,
                losses: sql`${userStats.losses} + ${lossIncrement}`,
                draws: sql`${userStats.draws} + ${drawIncrement}`,
            })
            .where(eq(userStats.userId, userId))
            .returning();

        return updatedStats;
    }

    async getGames(
        userId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<GameSummary[]> {
        const rawData = await this.db.query.games.findMany({
            where: (games) =>
                and(
                    or(eq(games.whiteId, userId), eq(games.blackId, userId)),
                    eq(games.status, 'finished'),
                ),
            columns: {
                id: true,
                reason: true,
                result: true,
                whiteId: true,
                blackId: true,
                updatedAt: true,
                gameStartedAt: true,
                timer: true,
                whiteEloDiff: true,
                blackEloDiff: true,
            },
            with: {
                white: {
                    columns: {
                        username: true,
                        image: true,
                    },
                },
                black: {
                    columns: {
                        username: true,
                        image: true,
                    },
                },
            },
            offset: (page - 1) * limit,
            limit,
            orderBy: desc(games.updatedAt),
        });

        return rawData.map(
            ({
                white,
                black,
                whiteId,
                blackId,
                gameStartedAt,
                updatedAt,
                result,
                whiteEloDiff,
                blackEloDiff,
                ...game
            }) => {
                const isWhite = userId === whiteId;
                const oppoent = isWhite ? black! : white;
                const oppoentId = isWhite ? blackId! : whiteId;
                const duration = updatedAt.getTime() - gameStartedAt!;
                const cleanResult =
                    result === 'draw'
                        ? 'draw'
                        : (isWhite ? 'white_won' : 'black_won') === result
                          ? 'win'
                          : 'loss';

                const ratingDiff = isWhite ? whiteEloDiff! : blackEloDiff!;

                return {
                    ...game,
                    opponent: {
                        id: oppoentId,
                        username: oppoent.username,
                        avatar: oppoent.image,
                    },
                    result: cleanResult,
                    duration,
                    ratingDiff,
                } as GameSummary;
            },
        );
    }
}
