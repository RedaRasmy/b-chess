import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { type Database } from '@bchess/db';
import { games, moves, PromotionPiece, userStats } from '@bchess/db/tables';
import { and, asc, eq, inArray, ne, or, sql } from 'drizzle-orm';
import {
    calcElo,
    checkGameEnd,
    DrawingGameWithPlayers,
    FinishedGame,
    FinishedGameWithPlayers,
    MatchedGame,
    MatchedGameWithPlayers,
    MoveType,
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
                    and(
                        eq(games.status, 'matching'),
                        eq(games.whiteId, userId),
                    ),
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
                    with: {
                        stats: true,
                    },
                },
                black: {
                    columns: {
                        username: true,
                        image: true,
                    },
                    with: {
                        stats: true,
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

    async deleteMatch(userId: string) {
        await this.db
            .delete(games)
            .where(
                and(eq(games.status, 'matching'), eq(games.whiteId, userId)),
            );
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
                    with: {
                        stats: true,
                    },
                },
                black: {
                    columns: {
                        username: true,
                        image: true,
                    },
                    with: {
                        stats: true,
                    },
                },
            },
        });

        return (playingGame as PlayingGameWithPlayers) ?? null;
    }

    async resign(userId: string) {
        const playingGame = await this.getPlayingGameWithPlayers(userId);

        if (!playingGame) return null;

        const result =
            playingGame.whiteId === userId ? 'black_won' : 'white_won';

        const elo = calcElo({
            whiteRank: playingGame.white.stats.rank,
            blackRank: playingGame.black.stats.rank,
            result: result,
        });

        return await this.db.transaction(async (tx) => {
            const [finishedGame] = await tx
                .update(games)
                .set({
                    status: 'finished',
                    gameOverReason: 'Resignation',
                    result,
                })
                .where(eq(games.id, playingGame.id))
                .returning();

            const winnerId =
                playingGame.whiteId === userId
                    ? playingGame.blackId
                    : playingGame.whiteId;

            const winnerDiff =
                winnerId === playingGame.whiteId
                    ? elo.whiteDiff
                    : elo.blackDiff;
            const userDiff =
                userId === playingGame.whiteId ? elo.whiteDiff : elo.blackDiff;

            await tx
                .update(userStats)
                .set({
                    wins: sql`${userStats.wins} + 1`,
                    rank: sql`GREATEST(0, ${userStats.rank} + ${winnerDiff})`,
                })
                .where(eq(userStats.userId, winnerId));

            await tx
                .update(userStats)
                .set({
                    losses: sql`${userStats.losses} + 1`,
                    rank: sql`GREATEST(0, ${userStats.rank} + ${userDiff})`,
                })
                .where(eq(userStats.userId, userId));

            return {
                game: {
                    ...finishedGame,
                    white: playingGame.white,
                    black: playingGame.black,
                } as FinishedGameWithPlayers,
                elo,
            };
        });
    }

    async requestDraw(userId: string): Promise<DrawingGameWithPlayers | null> {
        const playingGame = await this.getPlayingGameWithPlayers(userId);

        if (!playingGame) return null;

        // validation

        const requestDrawAt = playingGame.requestedDrawAt?.getTime() ?? null;
        const now = Date.now();
        const COOLDOWN_MS = 30_000;

        const isCooldown = requestDrawAt
            ? requestDrawAt + COOLDOWN_MS < now
            : false;

        if (playingGame.requestDraw || isCooldown) return null;

        const requester = playingGame.whiteId === userId ? 'w' : 'b';

        return await this.db.transaction(async (tx) => {
            const [newGame] = await tx
                .update(games)
                .set({
                    requestDraw: requester,
                    requestedDrawAt: new Date(),
                })
                .where(eq(games.id, playingGame.id))
                .returning();

            return {
                ...newGame,
                white: playingGame.white,
                black: playingGame.black,
            } as DrawingGameWithPlayers;
        });
    }

    async draw(userId: string) {
        const playingGame = await this.getPlayingGameWithPlayers(userId);

        if (!playingGame || !playingGame.requestDraw) return null;

        const userColor = playingGame.whiteId === userId ? 'w' : 'b';

        if (playingGame.requestDraw === userColor) {
            throw new Error("You can't accept your own draw request!");
        }

        const result = 'draw';

        const elo = calcElo({
            whiteRank: playingGame.white.stats.rank,
            blackRank: playingGame.black.stats.rank,
            result: result,
        });

        return await this.db.transaction(async (tx) => {
            const [finishedGame] = await tx
                .update(games)
                .set({
                    status: 'finished',
                    gameOverReason: 'Agreement',
                    result,
                })
                .where(eq(games.id, playingGame.id))
                .returning();

            await tx
                .update(userStats)
                .set({
                    draws: sql`${userStats.draws} + 1`,
                    rank: sql`GREATEST(
                        0,
                        ${userStats.rank} + CASE
                            WHEN ${userStats.userId} = ${playingGame.whiteId}
                            THEN ${elo.whiteDiff}
                            ELSE ${elo.blackDiff}
                        END
                    )`,
                })
                .where(
                    inArray(userStats.userId, [
                        playingGame.whiteId,
                        playingGame.blackId,
                    ]),
                );

            return {
                game: {
                    ...finishedGame,
                    white: playingGame.white,
                    black: playingGame.black,
                } as FinishedGameWithPlayers,
                elo,
            };
        });
    }

    async rejectDraw(userId: string): Promise<PlayingGameWithPlayers | null> {
        const playingGame = await this.getPlayingGameWithPlayers(userId);

        if (!playingGame || !playingGame.requestDraw) return null;

        return await this.db.transaction(async (tx) => {
            const [newGame] = await tx
                .update(games)
                .set({
                    requestDraw: null,
                })
                .where(eq(games.id, playingGame.id))
                .returning();

            return {
                ...newGame,
                white: playingGame.white,
                black: playingGame.black,
            } as PlayingGameWithPlayers;
        });
    }

    async timeout(userId: string) {
        const playingGame = await this.getPlayingGameWithPlayers(userId);

        if (!playingGame) return null;

        // Validation

        const timeLeft =
            playingGame.currentTurn == 'w'
                ? playingGame.whiteTimeLeft
                : playingGame.blackTimeLeft;

        const lastTimestamp =
            playingGame.lastMoveAt ?? playingGame.gameStartedAt;

        const isFinished = lastTimestamp + timeLeft <= Date.now();

        if (!isFinished) return null;

        // Action

        return await this.db.transaction(async (tx) => {
            // Update Game

            const result =
                playingGame.currentTurn === 'w' ? 'black_won' : 'white_won';

            const elo = calcElo({
                whiteRank: playingGame.white.stats.rank,
                blackRank: playingGame.black.stats.rank,
                result: result,
            });

            const [finishedGame] = await tx
                .update(games)
                .set({
                    status: 'finished',
                    gameOverReason: 'Timeout',
                    result,
                })
                .where(eq(games.id, playingGame.id))
                .returning();

            // Update Stats

            const loserId =
                playingGame.currentTurn === 'w'
                    ? playingGame.whiteId
                    : playingGame.blackId;
            const winnerId =
                playingGame.currentTurn === 'w'
                    ? playingGame.blackId
                    : playingGame.whiteId;

            const winnerDiff =
                winnerId === playingGame.whiteId
                    ? elo.whiteDiff
                    : elo.blackDiff;
            const loserDiff =
                loserId === playingGame.whiteId ? elo.whiteDiff : elo.blackDiff;

            await tx
                .update(userStats)
                .set({
                    wins: sql`${userStats.wins} + 1`,
                    rank: sql`GREATEST(0, ${userStats.rank} + ${winnerDiff})`,
                })
                .where(eq(userStats.userId, winnerId));

            await tx
                .update(userStats)
                .set({
                    losses: sql`${userStats.losses} + 1`,
                    rank: sql`GREATEST(0, ${userStats.rank} + ${loserDiff})`,
                })
                .where(eq(userStats.userId, loserId));
            return {
                game: {
                    ...finishedGame,
                    white: playingGame.white,
                    black: playingGame.black,
                } as FinishedGameWithPlayers,
                elo,
            };
        });
    }

    async addMove(game: PlayingGameWithPlayers, move: Move, chess: Chess) {
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
                game.currentTurn === 'w'
                    ? game.whiteTimeLeft
                    : game.blackTimeLeft;

            const { plus } = parseTimerOption(game.timer);

            const newTimeLeft = timeLeft - moveTime + plus * 1000;

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
                    requestDraw: null,
                    requestedDrawAt: null,
                    ...newTimestamps,
                })
                .where(eq(games.id, game.id))
                .returning();

            if (end) {
                // Update Stats
                const { result } = end;

                const whiteRank = game.white.stats.rank;
                const blackRank = game.black.stats.rank;

                const elo = calcElo({
                    whiteRank,
                    blackRank,
                    result,
                });

                const whiteChanges = {
                    win: result === 'draw' ? 0 : result === 'white_won' ? 1 : 0,
                    loss:
                        result === 'draw' ? 0 : result === 'black_won' ? 1 : 0,
                    draw: result === 'draw' ? 1 : 0,
                };

                const blackChanges = {
                    win: result === 'draw' ? 0 : result === 'black_won' ? 1 : 0,
                    loss:
                        result === 'draw' ? 0 : result === 'white_won' ? 1 : 0,
                    draw: result === 'draw' ? 1 : 0,
                };

                await tx
                    .update(userStats)
                    .set({
                        wins: sql`${userStats.wins} + ${whiteChanges.win}`,
                        losses: sql`${userStats.losses} + ${whiteChanges.loss}`,
                        draws: sql`${userStats.draws} + ${whiteChanges.draw}`,
                        rank: sql`GREATEST(0, ${userStats.rank} + ${elo.whiteDiff})`,
                    })
                    .where(eq(userStats.userId, game.whiteId));

                await tx
                    .update(userStats)
                    .set({
                        wins: sql`${userStats.wins} + ${blackChanges.win}`,
                        losses: sql`${userStats.losses} + ${blackChanges.loss}`,
                        draws: sql`${userStats.draws} + ${blackChanges.draw}`,
                        rank: sql`GREATEST(0, ${userStats.rank} + ${elo.blackDiff})`,
                    })
                    .where(eq(userStats.userId, game.blackId));

                return {
                    savedMove,
                    newGame: newGame as PlayingGame | FinishedGame,
                    elo,
                };
            }

            return {
                savedMove,
                newGame: newGame as PlayingGame | FinishedGame,
            };
        });
    }

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
}
