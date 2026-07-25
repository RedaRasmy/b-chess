import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Database } from '../database';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { eq, sql } from 'drizzle-orm';
import userStats from './schema';

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
}
