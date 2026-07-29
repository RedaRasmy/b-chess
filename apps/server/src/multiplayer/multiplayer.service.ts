import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { type Database } from '@bchess/db';
import { games, moves, PromotionPiece } from '@bchess/db/tables';
import { and, asc, eq, inArray, ne, or } from 'drizzle-orm';
import {
  checkGameEnd,
  FinishedGame,
  FinishedGameWithPlayers,
  MatchedGame,
  MatchedGameWithPlayers,
  parseTimerOption,
  PlayingGame,
  PlayingGameWithPlayers,
} from '@bchess/shared';
import { Chess, Move } from 'chess.js';

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

  async getMatchedGameWithPlayers(
    userId: string,
  ): Promise<MatchedGameWithPlayers | null> {
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

    return game as MatchedGameWithPlayers;
  }

  async setReady(gameId: string, userId: string): Promise<MatchedGame> {
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

    return game as MatchedGame;
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

  async getPlayingGameWithPlayers(
    userId: string,
  ): Promise<PlayingGameWithPlayers | null> {
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

    return (playingGame as PlayingGameWithPlayers) ?? null;
  }

  async resign(userId: string): Promise<FinishedGameWithPlayers | null> {
    const playingGame = await this.getPlayingGameWithPlayers(userId);

    if (!playingGame) return null;

    const [finishedGame] = await this.db
      .update(games)
      .set({
        status: 'finished',
        gameOverReason: 'Resignation',
        result: playingGame.whiteId === userId ? 'black_won' : 'white_won',
      })
      .where(eq(games.id, playingGame.id))
      .returning();

    return {
      ...finishedGame,
      white: playingGame.white,
      black: playingGame.black,
    } as FinishedGameWithPlayers;
  }

  async timeout(userId: string): Promise<FinishedGameWithPlayers | null> {
    const playingGame = await this.getPlayingGameWithPlayers(userId);

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
      .where(eq(games.id, playingGame.id))
      .returning();

    return {
      ...finishedGame,
      white: playingGame.white,
      black: playingGame.black,
    } as FinishedGameWithPlayers;
  }

  async addMove(game: PlayingGame, move: Move, chess: Chess) {
    return await this.db.transaction(async (tx) => {
      const lastTimestamp = game.lastMoveAt ?? game.gameStartedAt;

      const currentMoveAt = Date.now();
      const moveTime = currentMoveAt - lastTimestamp;

      const [savedMove] = await tx
        .insert(moves)
        .values({
          from: move.from,
          to: move.to,
          promotion: move.promotion as PromotionPiece,
          fenAfter: move.after,
          gameId: game.id,
          moveTime,
          playerColor: move.color,
          piece: move.piece,
          san: move.san,
          capturedPiece: move.captured,
          isCheck: chess.isCheck(),
          isCheckmate: chess.isCheckmate(),
        })
        .returning();

      const end = checkGameEnd(chess);

      const reason = end?.reason ?? null;
      const result = end?.result ?? null;

      const timeLeft =
        game.currentTurn === 'w' ? game.whiteTimeLeft : game.blackTimeLeft;

      const newTimeLeft = timeLeft - moveTime;

      const newTimestamps = {
        whiteTimeLeft:
          game.currentTurn === 'w' ? newTimeLeft : game.whiteTimeLeft,
        blackTimeLeft:
          game.currentTurn === 'b' ? newTimeLeft : game.blackTimeLeft,
        lastMoveAt: currentMoveAt,
      };

      const [newGame] = await tx
        .update(games)
        .set({
          status: end ? 'finished' : 'playing',
          gameOverReason: reason,
          result: result,
          currentFen: chess.fen(),
          currentTurn: chess.turn(),
          ...newTimestamps,
        })
        .where(eq(games.id, game.id))
        .returning();

      return { savedMove, newGame: newGame as PlayingGame | FinishedGame };
    });
  }

  async getMoves(gameId: string) {
    return await this.db.query.moves.findMany({
      where: (moves) => eq(moves.gameId, gameId),
      orderBy: asc(moves.createdAt),
      columns: {
        from: true,
        to: true,
        promotion: true,
      },
    });
  }
}
