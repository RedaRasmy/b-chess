import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Transaction, Database } from '@bchess/db';
import {
    Elo,
    FullGame,
    GameSummary,
    MatchedGame,
    MoveType,
    PlayingGame,
} from '@bchess/shared';
import { games, moves, Reason, Result } from '@bchess/db/tables';
import { and, asc, desc, eq, gt, inArray, or } from 'drizzle-orm';

@Injectable()
export class GamesService {
    constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

    async getMoves(gameId: string): Promise<MoveType[]> {
        const data = await this.db.query.moves.findMany({
            where: (moves) => eq(moves.gameId, gameId),
            orderBy: asc(moves.createdAt),
            columns: {
                from: true,
                to: true,
                promotion: true,
            },
        });
        return data as MoveType[];
    }

    async getFullCurrentGame(userId: string): Promise<FullGame | null> {
        const minuteAgo = new Date(Date.now() - 60 * 1000);

        const game = await this.db.query.games.findFirst({
            where: (games) =>
                and(
                    or(
                        inArray(games.status, ['preparing', 'playing']),
                        and(
                            eq(games.status, 'finished'),
                            gt(games.updatedAt, minuteAgo),
                        ),
                    ),
                    or(eq(games.whiteId, userId), eq(games.blackId, userId)),
                ),

            orderBy: desc(games.updatedAt),
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
                moves: {
                    columns: {
                        from: true,
                        to: true,
                        promotion: true,
                    },
                },
            },
        });

        if (!game) return null;

        return game as FullGame;
    }

    async getPlayingGame(gameId: string): Promise<PlayingGame> {
        const playingGame = await this.db.query.games.findFirst({
            where: (games) =>
                and(eq(games.status, 'playing'), eq(games.id, gameId)),
        });

        if (!playingGame) throw new Error('Game not found!');

        return playingGame as PlayingGame;
    }

    async endGame(
        tx: Transaction,
        {
            elo,
            gameId,
            reason,
            result,
        }: {
            gameId: string;
            reason: Reason;
            result: Result;
            elo: Elo;
        },
    ) {
        const [finishedGame] = await tx
            .update(games)
            .set({
                status: 'finished',
                reason,
                result,
                whiteEloDiff: elo.whiteDiff,
                blackEloDiff: elo.blackDiff,
            })
            .where(eq(games.id, gameId))
            .returning();

        return finishedGame;
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
                    gameStartedAt: isBothReady
                        ? Date.now()
                        : existingGame.gameStartedAt,
                })
                .where(eq(games.id, gameId))
                .returning();

            return updatedGame;
        });

        return game as MatchedGame;
    }

    async getUserGames(
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
