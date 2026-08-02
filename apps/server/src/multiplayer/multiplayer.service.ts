import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto } from '../games/dto/create-game.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { type Database } from '@bchess/db';

import {
    calcElo,
    DrawingGame,
    FinishedGame,
    FinishedGameWithPlayers,
    PlayingGame,
} from '@bchess/shared';
import { Chess, Move } from 'chess.js';
import { GamesService } from '../games/games.service';
import { PlayersService } from '../players/players.service';

@Injectable()
export class MultiplayerService {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: Database,
        private readonly gamesService: GamesService,
        private readonly playersService: PlayersService,
    ) {}

    async findOrCreateMatch(gameDto: CreateGameDto, userId: string) {
        const alreadyCreatedMatch =
            await this.gamesService.getCreatedMatch(userId);

        if (alreadyCreatedMatch) {
            return {
                status: 'QUEUED',
                game: alreadyCreatedMatch,
            } as const;
        }

        const MAX_RATING_DIFF = 200;
        const userStats = await this.playersService.getUserStats(userId);

        const userRating = userStats.rating;

        const minRating = userRating - MAX_RATING_DIFF;
        const maxRating = userRating + MAX_RATING_DIFF;

        const match = await this.gamesService.findMatch({
            userId,
            timer: gameDto.timer,
            minRating,
            maxRating,
        });

        if (match) {
            const game = await this.gamesService.match({
                gameId: match.id,
                blackId: userId,
                blackRating: userRating,
            });

            return {
                status: 'MATCH_FOUND',
                game,
                players: [match.whiteId, userId],
            } as const;
        }

        const newGame = await this.gamesService.createMatch({
            timer: gameDto.timer,
            whiteId: userId,
            whiteRating: userRating,
        });

        return { status: 'QUEUED', game: newGame } as const;
    }

    async resign(gameId: string, userId: string) {
        const playingGame = await this.gamesService.getPlayingGame(gameId);

        if (!playingGame) return null;

        const result =
            playingGame.whiteId === userId ? 'black_won' : 'white_won';

        const elo = calcElo({
            whiteRating: playingGame.whiteRating,
            blackRating: playingGame.blackRating,
            result: result,
        });

        return await this.db.transaction(async (tx) => {
            const finishedGame = await this.gamesService.endGame(tx, {
                gameId: playingGame.id,
                reason: 'Resignation',
                result,
                elo,
            });

            await this.playersService.updateStats(tx, {
                whiteId: playingGame.whiteId,
                blackId: playingGame.blackId,
                elo,
                result,
            });

            return {
                game: finishedGame as FinishedGame,
                elo,
            };
        });
    }

    async requestDraw(
        gameId: string,
        userId: string,
    ): Promise<DrawingGame | null> {
        const playingGame = await this.gamesService.getPlayingGame(gameId);

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

        const newGame = await this.gamesService.requestDraw({
            gameId: playingGame.id,
            requester,
        });

        return newGame as DrawingGame;
    }

    async draw(gameId: string, userId: string) {
        const playingGame = await this.gamesService.getPlayingGame(gameId);

        if (!playingGame || !playingGame.requestDraw) return null;

        const userColor = playingGame.whiteId === userId ? 'w' : 'b';

        if (playingGame.requestDraw === userColor) {
            throw new Error("You can't accept your own draw request!");
        }

        const result = 'draw';

        const elo = calcElo({
            whiteRating: playingGame.whiteRating,
            blackRating: playingGame.blackRating,
            result: result,
        });

        return await this.db.transaction(async (tx) => {
            const finishedGame = await this.gamesService.endGame(tx, {
                gameId: playingGame.id,
                reason: 'Agreement',
                result,
                elo,
            });

            await this.playersService.updateStats(tx, {
                whiteId: playingGame.whiteId,
                blackId: playingGame.blackId,
                elo,
                result,
            });

            return {
                game: finishedGame as FinishedGame,
                elo,
            };
        });
    }

    async timeout(gameId: string) {
        let playingGame: PlayingGame;
        try {
            playingGame = await this.gamesService.getPlayingGame(gameId);
        } catch (error) {
            return null;
        }

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
                whiteRating: playingGame.whiteRating,
                blackRating: playingGame.blackRating,
                result: result,
            });

            const finishedGame = await this.gamesService.endGame(tx, {
                gameId: playingGame.id,
                elo,
                reason: 'Timeout',
                result,
            });

            // Update Stats

            await this.playersService.updateStats(tx, {
                whiteId: playingGame.whiteId,
                blackId: playingGame.blackId,
                elo,
                result,
            });

            return {
                game: finishedGame as FinishedGame,
                elo,
            };
        });
    }

    async playMove(game: PlayingGame, move: Move, chess: Chess) {
        return await this.db.transaction(async (tx) => {
            const { newGame, savedMove, elo, end } =
                await this.gamesService.addMove(tx, {
                    chess,
                    game,
                    move,
                });

            if (end && elo) {
                const { result } = end;

                await this.playersService.updateStats(tx, {
                    whiteId: game.whiteId,
                    blackId: game.blackId,
                    elo,
                    result,
                });

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
}
