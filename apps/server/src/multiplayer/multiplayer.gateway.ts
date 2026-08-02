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
    type ClientToServerEvents,
    type MoveAck,
    type ServerToClientEvents,
} from '@bchess/shared';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Chess } from 'chess.js';
import { GamesService } from '../games/games.service';

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

const currentGames = new Map<string, Chess>();

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MultiplayerGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private readonly multiplayerService: MultiplayerService,
        private readonly gamesService: GamesService,
    ) {}

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

        const ongoingGame = await this.gamesService.getCurrentGameWithPlayers(
            user.id,
        );

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

        if (result.status === 'MATCH_FOUND') {
            result.players.forEach((userId) => {
                this.server
                    .to(`user:${userId}`)
                    .emit('game_found', result.game);
            });

            currentGames.set(gameId, new Chess());

            socket.data.currentGame = {
                id: gameId,
                playerColor,
            };
        } else {
            socket.emit('queue_joined', { gameId: result.game.id });

            socket.data.currentGame = {
                id: gameId,
                playerColor,
            };
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.CANCEL_MATCH)
    async handleCancelMatch(@ConnectedSocket() socket: TypedSocket) {
        await this.gamesService.deleteMatch(socket.data.user.id);
    }

    @SubscribeMessage(CLIENT_EVENTS.JOIN_GAME)
    async joinGame(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;
        const ongoingGame =
            await this.gamesService.getCurrentGameWithPlayers(userId);

        if (!ongoingGame) {
            throw new WsException({
                code: 'GAME_NOT_FOUND',
                message: 'Game not found!',
            });
        }

        socket.join(`game:${ongoingGame.id}`);

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
                    moves: [],
                });
            if (newGame.status === 'playing') {
                currentGames.set(newGame.id, new Chess());
            }
        } else {
            const moves = await this.gamesService.getMoves(ongoingGame.id);
            this.server
                .to(`user:${userId}`)
                .emit('sync', { ...ongoingGame, moves });
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.MOVE)
    async handleMove(
        @MessageBody() moveDto: MoveDto,
        @ConnectedSocket() socket: TypedSocket,
        @Ack() ack: MoveAck,
    ) {
        const userId = socket.data.user.id;
        const game = socket.data.currentGame;
        if (!game) {
            throw new WsException({
                code: 'GAME_NOT_FOUND',
                message: 'Game not found!',
            });
        }

        const playingGame = await this.gamesService.getPlayingGame(game.id);

        const gameId = playingGame.id;

        try {
            let chess = currentGames.get(gameId);

            if (!chess) {
                console.log('Memory: game lost');
                console.log('reconstructing the chess instance..');
                const newChess = new Chess();

                const moves = await this.gamesService.getMoves(gameId);

                moves.forEach((move) => {
                    newChess.move({
                        from: move.from,
                        to: move.to,
                        promotion: move.promotion ?? undefined,
                    });
                });

                currentGames.set(gameId, newChess);
                chess = newChess;
            }

            const move = chess.move(moveDto);

            const { savedMove, newGame, elo } =
                await this.multiplayerService.playMove(
                    playingGame,
                    move,
                    chess,
                );

            this.server.to(`game:${gameId}`).emit('new_move', savedMove);

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

                currentGames.delete(newGame.id);
            }
        } catch (error) {
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

            currentGames.delete(game.id);
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

            currentGames.delete(game.id);
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

            currentGames.delete(game.id);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.REJECT_DRAW)
    async handleDrawRejection(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;

        await this.gamesService.rejectDraw(userId);
    }
}
