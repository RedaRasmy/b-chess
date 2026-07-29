import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { type Database } from '@bchess/db';
import { games } from '@bchess/db/tables';
import { and, eq, inArray, ne, or } from 'drizzle-orm';
import {
  FinishedGameWithPlayers,
  OngoingGame,
  OngoingGameWithPlayers,
  parseTimerOption,
} from '@bchess/shared';

@Injectable()
export class MultiplayerService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findOrCreateMatch(dto: CreateGameDto, userId: string) {
    const match = await this.db.query.games.findFirst({
      where: (games) =>
        and(
          eq(games.status, 'matching'),
          eq(games.timer, dto.timer),
          ne(games.whiteId, userId),
        ),
    });

    if (!match) {
      const alreadyCreatedMatch = await this.db.query.games.findFirst({
        where: (games) =>
          and(eq(games.status, 'matching'), eq(games.whiteId, userId)),
      });

      if (alreadyCreatedMatch) {
        return {
          status: 'QUEUED',
          game: alreadyCreatedMatch,
        } as const;
      }

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
      .where(eq(games.id, match.id))
      .returning();

    return {
      status: 'MATCH_FOUND',
      game,
      players: [match.whiteId, userId],
    } as const;
  }

  async getOngoingGame(userId: string): Promise<OngoingGameWithPlayers | null> {
    const game = await this.db.query.games.findFirst({
      where: (games) =>
        and(
          inArray(games.status, ['preparing', 'playing']),
          or(eq(games.whiteId, userId), eq(games.blackId, userId)),
        ),

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
    });

    if (!game) return null;

    return game as OngoingGameWithPlayers;
  }

  async setReady(gameId: string, userId: string): Promise<OngoingGame> {
    const game = await this.db.transaction(async (tx) => {
      const [existingGame] = await tx
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .for('update');

      if (!existingGame || existingGame.status !== 'preparing') {
        return existingGame;
      }

      const isWhite = existingGame.whiteId === userId;
      const isBlack = existingGame.blackId === userId;

      const whiteReady = isWhite ? true : existingGame.whiteReady;
      const blackReady = isBlack ? true : existingGame.blackReady;
      const isBothReady = whiteReady && blackReady;

      const [updatedGame] = await tx
        .update(games)
        .set({
          whiteReady,
          blackReady,
          status: isBothReady ? 'playing' : 'preparing',
          gameStartedAt: isBothReady ? Date.now() : existingGame.gameStartedAt,
        })
        .where(eq(games.id, gameId))
        .returning();

      return updatedGame;
    });

    return game as OngoingGame;
  }

  async deleteMatch(userId: string) {
    await this.db
      .delete(games)
      .where(and(eq(games.status, 'matching'), eq(games.whiteId, userId)));
  }

  async getMatch(userId: string) {
    return await this.db.query.games.findFirst({
      where: (games) =>
        and(eq(games.status, 'matching'), eq(games.whiteId, userId)),
    });
  }

  async getPlayingGame(userId: string): Promise<OngoingGameWithPlayers | null> {
    const playingGame = await this.db.query.games.findFirst({
      where: (games) =>
        and(
          eq(games.status, 'playing'),
          or(eq(games.whiteId, userId), eq(games.blackId, userId)),
        ),
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
    });

    return (playingGame as OngoingGameWithPlayers) ?? null;
  }

  async resign(userId: string): Promise<FinishedGameWithPlayers | null> {
    const playingGame = await this.getPlayingGame(userId);

    if (!playingGame) return null;

    const [finishedGame] = await this.db
      .update(games)
      .set({
        status: 'finished',
        gameOverReason: 'Resignation',
        result: playingGame.whiteId === userId ? 'black_won' : 'white_won',
      })
      .returning();

    return {
      ...finishedGame,
      white: playingGame.white,
      black: playingGame.black,
    } as FinishedGameWithPlayers;
  }

  async timeout(userId: string): Promise<FinishedGameWithPlayers | null> {
    const playingGame = await this.getPlayingGame(userId);

    if (!playingGame) return null;

    // Validation

    const timeLeft =
      playingGame.currentTurn == 'w'
        ? playingGame.whiteTimeLeft
        : playingGame.blackTimeLeft;

    const lastTimestamp = playingGame.lastMoveAt ?? playingGame.gameStartedAt;

    const isFinished = lastTimestamp + timeLeft <= Date.now();

    if (!isFinished) return null;

    // Action

    const [finishedGame] = await this.db
      .update(games)
      .set({
        status: 'finished',
        gameOverReason: 'Timeout',
        result: playingGame.currentTurn === 'w' ? 'black_won' : 'white_won',
      })
      .returning();

    return {
      ...finishedGame,
      white: playingGame.white,
      black: playingGame.black,
    } as FinishedGameWithPlayers;
  }
}
