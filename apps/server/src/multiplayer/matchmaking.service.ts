import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Database } from '@bchess/db';
import { PlayersService } from '../players/players.service';
import { and, between, eq, ne, sql } from 'drizzle-orm';
import { games } from '@bchess/db/tables';
import { parseTimerOption } from '@bchess/shared';

@Injectable()
export class MatchmakingService {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: Database,
        private readonly playersService: PlayersService,
    ) {}

    async getMatch(userId: string) {
        return await this.db.query.games.findFirst({
            where: (games) =>
                and(eq(games.status, 'matching'), eq(games.whiteId, userId)),
        });
    }

    async findOrCreateMatch(
        { timer, min, max }: CreateGameDto,
        userId: string,
    ) {
        const alreadyCreatedMatch = await this.getMatch(userId);

        if (alreadyCreatedMatch) {
            return {
                status: 'QUEUED',
                game: alreadyCreatedMatch,
            } as const;
        }

        const userStats = await this.playersService.getUserStats(userId);

        const userRating = userStats.rating;

        const minRating = userRating + min;
        const maxRating = userRating + max;

        const match = await this.db.query.games.findFirst({
            where: (games) =>
                and(
                    eq(games.status, 'matching'),
                    eq(games.timer, timer),
                    ne(games.whiteId, userId),
                    between(games.whiteRating, minRating, maxRating),
                    between(
                        sql`${userRating}`,
                        games.minRating,
                        games.maxRating,
                    ),
                ),
        });

        if (match) {
            const [game] = await this.db
                .update(games)
                .set({
                    status: 'preparing',
                    blackId: userId,
                    blackRating: userRating,
                })
                .where(eq(games.id, match.id))
                .returning();

            if (!game) throw new NotFoundException('Game not found!');

            return {
                status: 'MATCH_FOUND',
                game,
                players: [match.whiteId, userId],
            } as const;
        }

        const { base } = parseTimerOption(timer);
        const [newGame] = await this.db
            .insert(games)
            .values({
                timer: timer,
                whiteId: userId,
                whiteRating: userRating,
                minRating,
                maxRating,
                blackTimeLeft: base * 1000, // ms
                whiteTimeLeft: base * 1000,
            })
            .returning();

        if (!newGame) throw new Error('Failed to insert new game');

        return { status: 'QUEUED', game: newGame } as const;
    }

    async cancelMatch(userId: string) {
        await this.db
            .delete(games)
            .where(
                and(eq(games.status, 'matching'), eq(games.whiteId, userId)),
            );
    }
}
