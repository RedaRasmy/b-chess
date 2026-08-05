import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { type Database } from '@bchess/db';

import {
    calcElo,
    DrawingGame,
    FinishedGame,
    PlayingGame,
} from '@bchess/shared';
import { GamesService } from '../games/games.service';
import { PlayersService } from '../players/players.service';

@Injectable()
export class MultiplayerService {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: Database,
        private readonly gamesService: GamesService,
        private readonly playersService: PlayersService,
    ) {}

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
}
