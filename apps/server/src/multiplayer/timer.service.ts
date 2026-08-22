import { calcElo, FinishedGame, PlayingGame } from '@bchess/shared';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { LiveGamesService } from './live-games.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GamesService } from '../games/games.service';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Database } from '@bchess/db';
import { PlayersService } from '../players/players.service';

@Injectable()
export class TimerService implements OnModuleInit {
    private deadlines = new Map<string, number>();

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: Database,
        private readonly gamesService: GamesService,
        private readonly liveGamesService: LiveGamesService,
        private readonly eventEmitter: EventEmitter2,
        private readonly playersService: PlayersService,
    ) {}

    onModuleInit() {
        setInterval(() => {
            this.check().catch(() => {});
        }, 250);
    }

    setDeadline(gameId: string, remainingMs: number, ref?: number) {
        this.deadlines.set(gameId, (ref ?? Date.now()) + remainingMs);
    }

    clearDeadline(gameId: string) {
        this.deadlines.delete(gameId);
    }

    getDeadline(gameId: string) {
        return this.deadlines.get(gameId);
    }

    exist(gameId: string): boolean {
        return this.deadlines.get(gameId) !== undefined;
    }

    private async check() {
        const expired: string[] = [];
        for (const [id, deadline] of this.deadlines) {
            if (deadline <= Date.now()) expired.push(id);
        }
        for (const id of expired) {
            this.deadlines.delete(id);
            await this.resolveAndEmit(id);
        }
    }

    private async resolveAndEmit(gameId: string) {
        const result = await this.timeout(gameId);
        if (result) {
            this.liveGamesService.deleteGame(result.game.id);
            this.eventEmitter.emit('game.finished', result);
        }
    }

    async timeout(gameId: string) {
        let playingGame: PlayingGame;
        try {
            playingGame = await this.gamesService.getPlayingGame(gameId);
        } catch {
            return null;
        }

        // Validation

        const timeLeft =
            playingGame.currentTurn == 'w' ? playingGame.whiteTimeLeft : playingGame.blackTimeLeft;

        const lastTimestamp = playingGame.lastMoveAt ?? playingGame.gameStartedAt;

        const isFinished = lastTimestamp + timeLeft <= Date.now();

        if (!isFinished) return null;

        // Action

        return await this.db.transaction(async (tx) => {
            // Update Game

            const result = playingGame.currentTurn === 'w' ? 'black_won' : 'white_won';

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
