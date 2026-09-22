import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { type Database } from '@bchess/db';
import { calcElo, FinishedGame } from '@bchess/shared';
import { GamesService } from '../games/games.service';
import { PlayersService } from '../players/players.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ResignService {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: Database,
        private readonly gamesService: GamesService,
        private readonly playersService: PlayersService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async resign(gameId: string, userId: string) {
        const playingGame = await this.gamesService.getPlayingGame(gameId);

        if (!playingGame) return null;

        const result = playingGame.whiteId === userId ? 'black_won' : 'white_won';

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

    async resignAndEmit(userId: string) {
        const activeGame = await this.gamesService.getActiveGameByUserId(userId);

        if (!activeGame) return null;

        const result = activeGame.whiteId === userId ? 'black_won' : 'white_won';

        const elo = calcElo({
            whiteRating: activeGame.whiteRating,
            blackRating: activeGame.blackRating,
            result: result,
        });

        await this.db.transaction(async (tx) => {
            const finishedGame = await this.gamesService.endGame(tx, {
                gameId: activeGame.id,
                reason: 'Resignation',
                result,
                elo,
            });

            await this.playersService.updateStats(tx, {
                whiteId: activeGame.whiteId,
                blackId: activeGame.blackId,
                elo,
                result,
            });

            this.eventEmitter.emit('game.finished', {
                game: finishedGame,
                elo,
            });
        });
    }
}
