import { HttpException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Transaction, Database } from '@bchess/db';
import {
    calcElo,
    checkGameEnd,
    Elo,
    FinishedGame,
    FullGame,
    GameSummary,
    getOppositeColor,
    MatchedGame,
    MoveType,
    parseTimerOption,
    PlayingGame,
    PreparingGame,
} from '@bchess/shared';
import {
    games,
    moves,
    PromotionPiece,
    Reason,
    Result,
    TimerOption,
} from '@bchess/db/tables';
import {
    and,
    asc,
    between,
    desc,
    eq,
    gt,
    inArray,
    isNotNull,
    ne,
    or,
    sql,
} from 'drizzle-orm';
import { Chess, Color, Move } from 'chess.js';

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

    async getMatch(userId: string) {
        return await this.db.query.games.findFirst({
            where: (games) =>
                and(eq(games.status, 'matching'), eq(games.whiteId, userId)),
        });
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

    async getCreatedMatch(userId: string) {
        return await this.db.query.games.findFirst({
            where: (games) =>
                and(eq(games.status, 'matching'), eq(games.whiteId, userId)),
        });
    }

    async findMatch({
        maxRating,
        minRating,
        timer,
        userId,
    }: {
        timer: TimerOption;
        userId: string;
        minRating: number;
        maxRating: number;
    }) {
        return await this.db.query.games.findFirst({
            where: (games) =>
                and(
                    eq(games.status, 'matching'),
                    eq(games.timer, timer),
                    ne(games.whiteId, userId),
                    between(games.whiteRating, minRating, maxRating),
                ),
        });
    }

    async match({
        gameId,
        blackId,
        blackRating,
    }: {
        gameId: string;
        blackId: string;
        blackRating: number;
    }) {
        const [game] = await this.db
            .update(games)
            .set({
                status: 'preparing',
                blackId,
                blackRating,
            })
            .where(eq(games.id, gameId))
            .returning();

        if (!game) throw new HttpException('Game not found!', 404);

        return game as PreparingGame;
    }

    async createMatch({
        timer,
        whiteId,
        whiteRating,
    }: {
        timer: TimerOption;
        whiteId: string;
        whiteRating: number;
    }) {
        const { base } = parseTimerOption(timer);
        const data = await this.db
            .insert(games)
            .values({
                timer: timer,
                whiteId,
                blackTimeLeft: base * 1000, // ms
                whiteTimeLeft: base * 1000,
                whiteRating,
            })
            .returning();

        return data[0]!;
    }

    async deleteMatch(userId: string) {
        await this.db
            .delete(games)
            .where(
                and(eq(games.status, 'matching'), eq(games.whiteId, userId)),
            );
    }

    async addMove(
        tx: Transaction,
        {
            game,
            move,
            end,
        }: {
            game: PlayingGame;
            move: Move;
            end?: {
                result: Result;
                reason: Reason;
            };
        },
    ) {
        const lastTimestamp = game.lastMoveAt ?? game.gameStartedAt;

        const currentMoveAt = Date.now();
        const moveTime = currentMoveAt - lastTimestamp;

        const data = await tx
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
            })
            .returning();

        const savedMove = data[0]!;

        const reason = end?.reason ?? null;
        const result = end?.result ?? null;

        const timeLeft =
            game.currentTurn === 'w' ? game.whiteTimeLeft : game.blackTimeLeft;

        const { plus } = parseTimerOption(game.timer);

        const newTimeLeft = timeLeft - moveTime + plus * 1000;

        const newTimestamps = {
            whiteTimeLeft:
                game.currentTurn === 'w' ? newTimeLeft : game.whiteTimeLeft,
            blackTimeLeft:
                game.currentTurn === 'b' ? newTimeLeft : game.blackTimeLeft,
            lastMoveAt: currentMoveAt,
        };

        const whiteRating = game.whiteRating;
        const blackRating = game.blackRating;

        const elo =
            result &&
            calcElo({
                whiteRating,
                blackRating,
                result,
            });

        const [newGame] = await tx
            .update(games)
            .set({
                ...newTimestamps,
                status: end ? 'finished' : 'playing',
                reason,
                result: result,
                currentFen: move.after,
                currentTurn: getOppositeColor(move.color),
                requestDraw: null,
                requestedDrawAt: null,
                whiteEloDiff: elo?.whiteDiff,
                blackEloDiff: elo?.blackDiff,
            })
            .where(eq(games.id, game.id))
            .returning();

        if (!newGame) throw new HttpException('Game not found!', 404);

        return {
            savedMove,
            newGame: newGame as PlayingGame | FinishedGame,
            end,
            elo,
        };
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

    async requestDraw({
        requester,
        gameId,
    }: {
        requester: Color;
        gameId: string;
    }) {
        const [newGame] = await this.db
            .update(games)
            .set({
                requestDraw: requester,
                requestedDrawAt: new Date(),
            })
            .where(eq(games.id, gameId))
            .returning();

        return newGame ?? null;
    }

    async rejectDraw(userId: string): Promise<PlayingGame | null> {
        const [newGame] = await this.db
            .update(games)
            .set({
                requestDraw: null,
            })
            .where(
                and(
                    or(eq(games.whiteId, userId), eq(games.blackId, userId)),
                    eq(games.status, 'playing'),
                    isNotNull(games.requestDraw),
                ),
            )
            .returning();

        return (newGame as PlayingGame) ?? null;
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
