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
import { MoveDto } from './dto/move.dto';
import { CreateGameDto } from './dto/create-game.dto';
import {
    CLIENT_EVENTS,
    type ClientToServerEvents,
    type MoveAck,
    type ServerToClientEvents,
} from '@bchess/shared';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Chess } from 'chess.js';

type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    {
        user: UserSession['user'];
    }
>;

const currentGames = new Map<string, Chess>();

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MultiplayerGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly multiplayerService: MultiplayerService) {}

    @WebSocketServer()
    server!: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        DefaultEventsMap,
        {
            user: UserSession['user'];
        }
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

        const ongoingGame =
            await this.multiplayerService.getMatchedGameWithPlayers(user.id);

        if (ongoingGame) {
            const opponentId =
                ongoingGame.whiteId === user.id
                    ? ongoingGame.blackId!
                    : ongoingGame.whiteId;

            socket.join(`game:${ongoingGame.id}`);
            this.server
                .to(`user:${opponentId}`)
                .emit('opponent_status_changed', {
                    status: 'connected',
                });
        }
    }

    async handleDisconnect(socket: TypedSocket) {
        const userId = socket.data.user.id;
        const ongoingGame =
            await this.multiplayerService.getMatchedGameWithPlayers(userId);

        if (ongoingGame) {
            const opponentId =
                ongoingGame.whiteId === userId
                    ? ongoingGame.blackId!
                    : ongoingGame.whiteId;

            this.server
                .to(`user:${opponentId}`)
                .emit('opponent_status_changed', {
                    status: 'disconnected',
                });
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.JOIN_QUEUE)
    async handleJoinQueue(
        @ConnectedSocket() socket: TypedSocket,
        @MessageBody() payload: CreateGameDto,
    ) {
        const result = await this.multiplayerService.findOrCreateMatch(
            payload,
            socket.data.user.id,
        );

        console.log(result);

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
        await this.multiplayerService.deleteMatch(socket.data.user.id);
        console.log('match deleted');
    }

    @SubscribeMessage(CLIENT_EVENTS.JOIN_GAME)
    async joinGame(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;
        const ongoingGame =
            await this.multiplayerService.getMatchedGameWithPlayers(userId);

        if (!ongoingGame) {
            throw new WsException({
                code: 'GAME_NOT_FOUND',
                message: 'Game not found!',
            });
        }

        socket.join(`game:${ongoingGame.id}`);

        if (ongoingGame.status === 'preparing') {
            const newGame = await this.multiplayerService.setReady(
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
            const moves = await this.multiplayerService.getMoves(
                ongoingGame.id,
            );
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
        const playingGame =
            await this.multiplayerService.getPlayingGameWithPlayers(userId);

        if (!playingGame) {
            throw new WsException({
                code: 'GAME_NOT_FOUND',
                message: 'Game not found!',
            });
        }

        const gameId = playingGame.id;

        try {
            let chess = currentGames.get(gameId);

            if (!chess) {
                console.log('Memory: game lost');
                console.log('reconstructing the chess instance..');
                const newChess = new Chess();

                const moves = await this.multiplayerService.getMoves(gameId);

                moves.forEach((move) => {
                    newChess.move({
                        from: move.from,
                        to: move.to,
                        promotion: move.promotion ?? undefined,
                    });
                });

                chess = newChess;
            }

            const move = chess.move(moveDto);

            const { savedMove, newGame } =
                await this.multiplayerService.addMove(playingGame, move, chess);

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

        const finishedGame = await this.multiplayerService.resign(userId);

        if (finishedGame) {
            this.server
                .to(`game:${finishedGame.id}`)
                .emit('game_finished', finishedGame);

            currentGames.delete(finishedGame.id);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.TIMEOUT)
    async handleTimeout(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;

        const finishedGame = await this.multiplayerService.timeout(userId);

        if (finishedGame) {
            this.server
                .to(`game:${finishedGame.id}`)
                .emit('game_finished', finishedGame);

            currentGames.delete(finishedGame.id);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.RQUEST_DRAW)
    async handleDrawRequest(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;

        const newGame = await this.multiplayerService.requestDraw(userId);

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

        const finishedGame = await this.multiplayerService.draw(userId);

        if (finishedGame) {
            this.server
                .to(`game:${finishedGame.id}`)
                .emit('game_finished', finishedGame);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.REJECT_DRAW)
    async handleDrawRejection(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;

        await this.multiplayerService.rejectDraw(userId);
    }
}
