import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import type { Database } from '@bchess/db';
import { PlayersService } from '../players/players.service';
import {
    calcElo,
    FinishedGame,
    getOppositeColor,
    parseTimerOption,
    PlayingGame,
    Reason,
    Result,
} from '@bchess/shared';
import { Move } from 'chess.js';
import { games, moves, PromotionPiece } from '@bchess/db/tables';
import { eq } from 'drizzle-orm';

@Injectable()
export class MoveService {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: Database,
        private readonly playersService: PlayersService,
    ) {}

    async saveMove({
        game,
        move,
        isCheck,
        end,
    }: {
        game: PlayingGame;
        isCheck: boolean;
        move: Move;
        end?: {
            result: Result;
            reason: Reason;
        };
    }) {
        return await this.db.transaction(async (tx) => {
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
                    isCheck,
                })
                .returning();

            const savedMove = data[0]!;

            const reason = end?.reason ?? null;
            const result = end?.result ?? null;

            const timeLeft = game.currentTurn === 'w' ? game.whiteTimeLeft : game.blackTimeLeft;

            const { plus } = parseTimerOption(game.timer);

            const newTimeLeft = timeLeft - moveTime + plus * 1000;

            const newTimestamps = {
                whiteTimeLeft: game.currentTurn === 'w' ? newTimeLeft : game.whiteTimeLeft,
                blackTimeLeft: game.currentTurn === 'b' ? newTimeLeft : game.blackTimeLeft,
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

            if (!newGame) throw new NotFoundException('Game not found!');

            if (end && elo) {
                const { result } = end;

                await this.playersService.updateStats(tx, {
                    whiteId: game.whiteId,
                    blackId: game.blackId,
                    elo,
                    result,
                });
            }

            return {
                savedMove,
                newGame: newGame as PlayingGame | FinishedGame,
                elo,
            };
        });
    }
}
