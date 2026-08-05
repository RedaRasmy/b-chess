import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Database } from '@bchess/db';
import { PlayersService } from '../players/players.service';
import {
    calcElo,
    DrawingGame,
    FinishedGame,
    PlayingGame,
} from '@bchess/shared';
import { GamesService } from '../games/games.service';
import { games } from '@bchess/db/tables';
import { and, eq, isNotNull, or } from 'drizzle-orm';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class DrawService {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: Database,
        private readonly playersService: PlayersService,
        private readonly gamesService: GamesService,
    ) {}

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

        const [newGame] = await this.db
            .update(games)
            .set({
                requestDraw: requester,
                requestedDrawAt: new Date(),
            })
            .where(eq(games.id, gameId))
            .returning();

        if (!newGame) throw new NotFoundException('Game not found!');

        return newGame as DrawingGame;
    }

    async draw(gameId: string, userId: string) {
        const playingGame = await this.gamesService.getPlayingGame(gameId);

        if (!playingGame.requestDraw)
            throw new WsException({
                message: "You can't draw",
            });

        const userColor = playingGame.whiteId === userId ? 'w' : 'b';

        if (playingGame.requestDraw === userColor) {
            throw new WsException({
                message: "You can't draw",
            });
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

    async rejectDraw(userId: string): Promise<PlayingGame> {
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

        if (!newGame) throw new NotFoundException('Game not found!');

        return newGame as PlayingGame;
    }
}
