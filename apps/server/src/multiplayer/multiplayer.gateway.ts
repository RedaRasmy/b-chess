import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    ConnectedSocket,
    OnGatewayDisconnect,
    WebSocketServer,
    WsException,
    Ack,
} from '@nestjs/websockets';
import { MultiplayerService } from './multiplayer.service';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/auth';
import { MoveDto } from '../games/dto/move.dto';
import { CreateGameDto } from '../games/dto/create-game.dto';
import {
    CLIENT_EVENTS,
    LiveGame,
    type ClientToServerEvents,
    type MoveAck,
    type ServerToClientEvents,
} from '@bchess/shared';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Chess } from 'chess.js';
import { GamesService } from '../games/games.service';
import { Logger } from '@nestjs/common';

type Data = {
    user: UserSession['user'];
    currentGame: {
        id: string;
        playerColor: 'w' | 'b';
    } | null;
};

type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    Data
>;

const liveGames = new Map<string, LiveGame>();

function initGame(): LiveGame {
    return {
        chess: new Chess(),
        white: {
            status: 'connected',
        },
        black: {
            status: 'connected',
        },
    };
}

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MultiplayerGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private readonly multiplayerService: MultiplayerService,
        private readonly gamesService: GamesService,
    ) {}

    private readonly logger = new Logger(MultiplayerGateway.name);

    @WebSocketServer()
    server!: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        DefaultEventsMap,
        Data
    >;

    async handleConnection(socket: TypedSocket) {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(socket.handshake.headers),
        });

        if (!session) {
            socket.disconnect();
            return;
        }
        const user = session.user;

        socket.data.user = user;
        socket.join(`user:${user.id}`);

        const ongoingGame = await this.gamesService.getFullCurrentGame(user.id);

        if (ongoingGame) {
            const opponentId =
                ongoingGame.whiteId === user.id
                    ? ongoingGame.blackId!
                    : ongoingGame.whiteId;

            socket.join(`game:${ongoingGame.id}`);

            const playerColor = user.id === ongoingGame.whiteId ? 'w' : 'b';

            socket.data.currentGame = {
                id: ongoingGame.id,
                playerColor,
            };

            const gameId = ongoingGame.id;
            const liveGame = liveGames.get(gameId);

            this.server.to(`user:${user.id}`).emit('sync', {
                ...ongoingGame,
                whiteStatus: liveGame?.white.status ?? 'unknown',
                blackStatus: liveGame?.black.status ?? 'unknown',
            });

            if (liveGame) {
                const playerColor = user.id === ongoingGame.whiteId ? 'w' : 'b';

                liveGames.set(gameId, {
                    chess: liveGame.chess,
                    white: {
                        ...liveGame.white,
                        status:
                            playerColor === 'w'
                                ? 'connected'
                                : liveGame.white.status,
                    },
                    black: {
                        ...liveGame.black,
                        status:
                            playerColor === 'b'
                                ? 'connected'
                                : liveGame.black.status,
                    },
                });
            }

            this.server.to(`user:${opponentId}`).emit('player_status_changed', {
                status: 'connected',
                color: playerColor,
            });
        }
    }

    async handleDisconnect(socket: TypedSocket) {
        const game = socket.data.currentGame;

        if (game) {
            this.server.to(`game:${game.id}`).emit('player_status_changed', {
                status: 'disconnected',
                color: game.playerColor,
            });

            const liveGame = liveGames.get(game.id);

            if (liveGame) {
                const playerColor = game.playerColor;

                liveGames.set(game.id, {
                    chess: new Chess(),
                    white: {
                        status:
                            playerColor === 'w'
                                ? 'disconnected'
                                : liveGame.white.status,
                    },
                    black: {
                        status:
                            playerColor === 'b'
                                ? 'disconnected'
                                : liveGame.black.status,
                    },
                });
            }
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.JOIN_QUEUE)
    async handleJoinQueue(
        @ConnectedSocket() socket: TypedSocket,
        @MessageBody() gameDto: CreateGameDto,
    ) {
        const userId = socket.data.user.id;
        const result = await this.multiplayerService.findOrCreateMatch(
            gameDto,
            userId,
        );

        const playerColor = result.game.whiteId === userId ? 'w' : 'b';
        const gameId = result.game.id;

        socket.data.currentGame = {
            id: gameId,
            playerColor,
        };

        if (result.status === 'MATCH_FOUND') {
            result.players.forEach((userId) => {
                this.server
                    .to(`user:${userId}`)
                    .emit('game_found', result.game);
            });
        } else {
            socket.emit('queue_joined', { gameId: result.game.id });
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.CANCEL_MATCH)
    async handleCancelMatch(@ConnectedSocket() socket: TypedSocket) {
        await this.gamesService.deleteMatch(socket.data.user.id);
    }

    @SubscribeMessage(CLIENT_EVENTS.JOIN_GAME)
    async joinGame(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;
        const ongoingGame = await this.gamesService.getFullCurrentGame(userId);

        if (!ongoingGame) {
            throw new WsException({
                code: 'GAME_NOT_FOUND',
                message: 'Game not found!',
            });
        }

        const playerColor = ongoingGame.whiteId === userId ? 'w' : 'b';

        socket.join(`game:${ongoingGame.id}`);
        socket.data.currentGame = {
            id: ongoingGame.id,
            playerColor,
        };

        if (ongoingGame.status === 'preparing') {
            const newGame = await this.gamesService.setReady(
                ongoingGame.id,
                userId,
            );
            this.server
                .to([`user:${newGame.whiteId}`, `user:${newGame.blackId}`])
                .emit('sync', {
                    ...newGame,
                    white: ongoingGame.white,
                    black: ongoingGame.black,
                    moves: ongoingGame.moves,
                    whiteStatus: 'connected',
                    blackStatus: 'connected',
                });
            if (newGame.status === 'playing') {
                liveGames.set(newGame.id, initGame());
                this.logger.log('New game inserted to memory');
                this.logger.log(`Games in memory : ${liveGames.size}`);
            }
        } else {
            const liveGame = liveGames.get(ongoingGame.id);
            // Note: if the game has finished liveGame will be undefined
            const whiteStatus = liveGame?.white.status ?? null;
            const blackStatus = liveGame?.black.status ?? null;

            this.server.to(`user:${userId}`).emit('sync', {
                ...ongoingGame,
                whiteStatus,
                blackStatus,
            });
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.MOVE)
    async handleMove(
        @MessageBody() moveDto: MoveDto,
        @ConnectedSocket() socket: TypedSocket,
        @Ack() ack: MoveAck,
    ) {
        const game = socket.data.currentGame;
        if (!game) {
            this.logger.warn('data.currentGame not found');
            throw new WsException({
                code: 'GAME_NOT_FOUND',
                message: 'Game not found!',
            });
        }

        const playingGame = await this.gamesService.getPlayingGame(game.id);

        const gameId = playingGame.id;

        try {
            let liveGame = liveGames.get(gameId);
            let chess = liveGame?.chess;

            if (!chess) {
                this.logger.warn(
                    `Game not found in memory ,games in memory: ${liveGames.size}`,
                );
                const newChess = new Chess();

                const moves = await this.gamesService.getMoves(gameId);

                moves.forEach((move) => {
                    newChess.move({
                        from: move.from,
                        to: move.to,
                        promotion: move.promotion ?? undefined,
                    });
                });

                const playerColor = game.playerColor;

                liveGames.set(gameId, {
                    chess: newChess,
                    white: {
                        status: playerColor === 'w' ? 'connected' : 'unknown',
                    },
                    black: {
                        status: playerColor === 'b' ? 'connected' : 'unknown',
                    },
                });

                chess = newChess;
            }

            this.logger.debug('played moves : ', chess.moves().length);

            const move = chess.move(moveDto);

            const playerColor = game.playerColor;

            liveGames.set(gameId, {
                chess,
                white: {
                    status: playerColor === 'w' ? 'connected' : 'unknown',
                },
                black: {
                    status: playerColor === 'b' ? 'connected' : 'unknown',
                },
            });

            this.logger.debug('move is valid');

            const { savedMove, newGame, elo } =
                await this.multiplayerService.playMove(
                    playingGame,
                    move,
                    chess,
                );

            this.server.to(`game:${gameId}`).emit('new_move', savedMove);
            this.server.to(`game:${game.id}`).emit('player_status_changed', {
                status: 'connected',
                color: playerColor,
            });

            ack({
                status: 'success',
                timestamps: {
                    whiteTimeLeft: newGame.whiteTimeLeft,
                    blackTimeLeft: newGame.blackTimeLeft,
                    gameStartedAt: newGame.gameStartedAt,
                    lastMoveAt: newGame.lastMoveAt,
                },
            });

            if (elo && newGame.reason && newGame.result) {
                this.server.to(`game:${gameId}`).emit('game_finished', {
                    ...elo,
                    reason: newGame.reason,
                    result: newGame.result,
                });

                liveGames.delete(newGame.id);
                this.logger.log(`Game deleted from memory (${newGame.reason})`);
                this.logger.log(`Games in memory : ${liveGames.size}`);
            }
        } catch (error) {
            this.logger.error(error);
            ack({
                status: 'error',
                error: error,
                timestamps: {
                    whiteTimeLeft: playingGame.whiteTimeLeft,
                    blackTimeLeft: playingGame.blackTimeLeft,
                    gameStartedAt: playingGame.gameStartedAt,
                    lastMoveAt: playingGame.lastMoveAt,
                },
            });
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.RESIGN)
    async handleResign(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;
        const game = socket.data.currentGame;

        if (!game) throw new WsException('Game not found!');

        const end = await this.multiplayerService.resign(game.id, userId);

        if (end) {
            const { game, elo } = end;
            this.server.to(`game:${game.id}`).emit('game_finished', {
                ...elo,
                reason: game.reason,
                result: game.result,
            });

            liveGames.delete(game.id);
            this.logger.log('Game deleted from memory (Resignation)');
            this.logger.log(`Games in memory : ${liveGames.size}`);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.TIMEOUT)
    async handleTimeout(@ConnectedSocket() socket: TypedSocket) {
        const game = socket.data.currentGame;

        if (!game) throw new WsException('Game not found!');

        const result = await this.multiplayerService.timeout(game.id);

        if (result) {
            const { game, elo } = result;
            this.server.to(`game:${game.id}`).emit('game_finished', {
                reason: game.reason,
                result: game.result,
                ...elo,
            });

            liveGames.delete(game.id);
            this.logger.log('Game deleted from memory (Timeout)');
            this.logger.log(`Games in memory : ${liveGames.size}`);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.RQUEST_DRAW)
    async handleDrawRequest(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;
        const game = socket.data.currentGame;

        if (!game) throw new WsException('Game not found!');

        const newGame = await this.multiplayerService.requestDraw(
            game.id,
            userId,
        );

        if (newGame) {
            this.server.to(`game:${newGame.id}`).emit('draw_request', {
                requestDraw: newGame.requestDraw,
                requestedDrawAt: newGame.requestedDrawAt,
            });
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.ACCEPT_DRAW)
    async handleDraw(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;
        const game = socket.data.currentGame;

        if (!game) throw new WsException('Game not found!');

        const end = await this.multiplayerService.draw(game.id, userId);

        if (end) {
            const { game, elo } = end;
            this.server.to(`game:${game.id}`).emit('game_finished', {
                reason: game.reason,
                result: game.result,
                ...elo,
            });

            liveGames.delete(game.id);
            this.logger.log('Game deleted from memory (Draw by agreement)');
            this.logger.log(`Games in memory : ${liveGames.size}`);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.REJECT_DRAW)
    async handleDrawRejection(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;

        await this.gamesService.rejectDraw(userId);
    }
}
