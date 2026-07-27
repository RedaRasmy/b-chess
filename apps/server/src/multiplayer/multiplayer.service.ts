import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { type Database } from '@bchess/db';
import { games } from '@bchess/db/tables';
import { and, eq, inArray, or } from 'drizzle-orm';
import { parseTimerOption } from '@bchess/shared';

@Injectable()
export class MultiplayerService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findOrCreateMatch(dto: CreateGameDto, userId: string) {
    const matching = await this.db.query.games.findFirst({
      where: (games) =>
        and(eq(games.status, 'matching'), eq(games.timer, dto.timer)),
    });

    if (!matching) {
      const { base } = parseTimerOption(dto.timer);
      const [newGame] = await this.db
        .insert(games)
        .values({
          timer: dto.timer,
          whiteId: userId,
          blackTimeLeft: base * 1000, // ms
          whiteTimeLeft: base * 1000,
        })
        .returning();
      return { status: 'QUEUED', game: newGame } as const;
    }

    const [game] = await this.db
      .update(games)
      .set({ status: 'preparing', blackId: userId })
      .where(eq(games.id, matching.id))
      .returning();

    return {
      status: 'MATCH_FOUND',
      game,
      players: [matching.whiteId, userId],
    } as const;
  }

  async getOngoingGame(userId: string) {
    return await this.db.query.games.findFirst({
      where: (games) =>
        and(
          inArray(games.status, ['preparing', 'playing']),
          or(eq(games.whiteId, userId), eq(games.blackId, userId)),
        ),
    });
  }
}
