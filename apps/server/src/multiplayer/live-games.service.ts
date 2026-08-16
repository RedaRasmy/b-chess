import { Injectable, Logger } from '@nestjs/common';
import { LiveGame } from './live-game';
import { MoveType } from '@bchess/shared';

@Injectable()
export class LiveGamesService {
    private games: Map<string, LiveGame>;
    private logger = new Logger(LiveGamesService.name);

    constructor() {
        this.games = new Map();
    }

    createGame(id: string, moves?: MoveType[]) {
        const game = new LiveGame(moves);
        this.games.set(id, game);

        this.logger.log('New game inserted to memory');
        this.logger.log(`Games in memory: ${this.size()}`);

        return game;
    }

    hasGame(id: string) {
        return this.games.has(id);
    }

    getGame(id: string) {
        return this.games.get(id);
    }

    deleteGame(id: string) {
        this.games.delete(id);

        this.logger.log('Game deleted from memory');
        this.logger.log(`Games in memory: ${this.size()}`);
    }

    size() {
        return this.games.size;
    }

    clear() {
        this.games.clear();
        this.logger.log('Memory has cleared');
    }
}
