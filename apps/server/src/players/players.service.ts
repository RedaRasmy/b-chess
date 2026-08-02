import { HttpException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Database, Transaction } from '@bchess/db';
import { eq, sql } from 'drizzle-orm';
import { Elo, Result } from '@bchess/shared';
import { userStats } from '@bchess/db/tables';

@Injectable()
export class PlayersService {
    constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

    async getUserStats(userId: string) {
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

        if (!stats) throw new HttpException('User stats not found', 404);

        return stats;
    }

    async updateStats(
        tx: Transaction,
        {
            blackId,
            elo,
            result,
            whiteId,
        }: {
            whiteId: string;
            blackId: string;
            result: Result;
            elo: Elo;
        },
    ) {
        const whiteChanges = {
            win: result === 'draw' ? 0 : result === 'white_won' ? 1 : 0,
            loss: result === 'draw' ? 0 : result === 'black_won' ? 1 : 0,
            draw: result === 'draw' ? 1 : 0,
        };

        const blackChanges = {
            win: result === 'draw' ? 0 : result === 'black_won' ? 1 : 0,
            loss: result === 'draw' ? 0 : result === 'white_won' ? 1 : 0,
            draw: result === 'draw' ? 1 : 0,
        };

        await tx
            .update(userStats)
            .set({
                wins: sql`${userStats.wins} + ${whiteChanges.win}`,
                losses: sql`${userStats.losses} + ${whiteChanges.loss}`,
                draws: sql`${userStats.draws} + ${whiteChanges.draw}`,
                rating: elo.newWhiteRating,
            })
            .where(eq(userStats.userId, whiteId));

        await tx
            .update(userStats)
            .set({
                wins: sql`${userStats.wins} + ${blackChanges.win}`,
                losses: sql`${userStats.losses} + ${blackChanges.loss}`,
                draws: sql`${userStats.draws} + ${blackChanges.draw}`,
                rating: elo.newBlackRating,
            })
            .where(eq(userStats.userId, blackId));
    }
}
