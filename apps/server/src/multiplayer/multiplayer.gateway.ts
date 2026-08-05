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
import { GamesService } from '../games/games.service';
import { Logger } from '@nestjs/common';
import { LiveGamesService } from './live-games.service';
import { Rooms } from './rooms';
import { MatchmakingService } from './matchmaking.service';
import { MoveService } from './move.service';
import { DrawService } from './draw.service';

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

type TypedServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    Data
>;

async function isConnected(server: TypedServer, userId: string) {
    const sockets = await server.in(Rooms.user(userId)).fetchSockets();
    return sockets.length > 0;
}

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MultiplayerGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private readonly multiplayerService: MultiplayerService,
        private readonly gamesService: GamesService,
        private readonly liveGamesService: LiveGamesService,
        private readonly matchmakingService: MatchmakingService,
        private readonly moveService: MoveService,
        private readonly drawService: DrawService,
    ) {}

    private readonly logger = new Logger(MultiplayerGateway.name);

    @WebSocketServer()
    server!: TypedServer;

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
        socket.join(Rooms.user(user.id));

        const ongoingGame = await this.gamesService.getFullCurrentGame(user.id);

        if (ongoingGame && ongoingGame.status !== 'finished') {
            socket.join(Rooms.game(ongoingGame.id));

            const playerColor = user.id === ongoingGame.whiteId ? 'w' : 'b';

            socket.data.currentGame = {
                id: ongoingGame.id,
                playerColor,
            };

            const gameId = ongoingGame.id;

            let liveGame = this.liveGamesService.getGame(gameId);

            if (!liveGame) {
                const moves = await this.gamesService.getMoves(gameId);
                const newLiveGame = this.liveGamesService.createGame(
                    gameId,
                    moves,
                );
                if (playerColor === 'w') {
                    const isBlackConnected = await isConnected(
                        this.server,
                        ongoingGame.blackId,
                    );
                    isBlackConnected
                        ? newLiveGame.setBlackConnected()
                        : newLiveGame.setBlackDisconnected();
                } else {
                    const isWhiteConnected = await isConnected(
                        this.server,
                        ongoingGame.whiteId,
                    );
                    isWhiteConnected
                        ? newLiveGame.setWhiteConnected()
                        : newLiveGame.setWhiteDisconnected();
                }
                liveGame = newLiveGame;
            }

            liveGame.setPlayerConnected(playerColor);

            this.server.to(Rooms.user(user.id)).emit('sync', {
                ...ongoingGame,
                whiteStatus: liveGame.getWhiteStatus(),
                blackStatus: liveGame.getBlackStatus(),
            });

            this.server
                .to(Rooms.game(ongoingGame.id))
                .emit('player_status_changed', {
                    status: 'connected',
                    color: playerColor,
                });
        }
    }

    async handleDisconnect(socket: TypedSocket) {
        const game = socket.data.currentGame;

        if (game) {
            this.server.to(Rooms.game(game.id)).emit('player_status_changed', {
                status: 'disconnected',
                color: game.playerColor,
            });

            const liveGame = this.liveGamesService.getGame(game.id);

            if (liveGame) {
                liveGame.setPlayerDisconnected(game.playerColor);
            }
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.JOIN_QUEUE)
    async handleJoinQueue(
        @ConnectedSocket() socket: TypedSocket,
        @MessageBody() gameDto: CreateGameDto,
    ) {
        const userId = socket.data.user.id;
        const result = await this.matchmakingService.findOrCreateMatch(
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
                    .to(Rooms.user(userId))
                    .emit('game_found', result.game);
            });

            const game = this.liveGamesService.createGame(result.game.id);

            const isWhiteConnected = await isConnected(
                this.server,
                result.game.whiteId,
            );
            if (!isWhiteConnected) {
                game.setBlackDisconnected();
            }
        } else {
            socket.emit('queue_joined', { gameId: result.game.id });
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.CANCEL_MATCH)
    async handleCancelMatch(@ConnectedSocket() socket: TypedSocket) {
        await this.matchmakingService.cancelMatch(socket.data.user.id);
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

        socket.join(Rooms.game(ongoingGame.id));
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
                .to(Rooms.users(newGame.whiteId, newGame.blackId))
                .emit('sync', {
                    ...newGame,
                    white: ongoingGame.white,
                    black: ongoingGame.black,
                    moves: ongoingGame.moves,
                    whiteStatus: 'connected',
                    blackStatus: 'connected',
                });
        } else {
            const liveGame = this.liveGamesService.getGame(ongoingGame.id);

            // Note: if the game has finished liveGame will be undefined
            const whiteStatus = liveGame?.getWhiteStatus() ?? null;
            const blackStatus = liveGame?.getBlackStatus() ?? null;

            this.server.to(Rooms.user(userId)).emit('sync', {
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
            let liveGame = this.liveGamesService.getGame(gameId);

            if (!liveGame) {
                this.logger.warn(
                    `Game not found in memory, will get recreated..`,
                );
                const moves = await this.gamesService.getMoves(gameId);

                liveGame = this.liveGamesService.createGame(gameId, moves);
            }

            const { move, end, isCheck } = liveGame.move(moveDto);

            const { savedMove, newGame, elo } = await this.moveService.saveMove(
                {
                    game: playingGame,
                    move,
                    end: end ?? undefined,
                    isCheck,
                },
            );

            const gameRoom = this.server.to(Rooms.game(gameId));

            gameRoom.emit('new_move', savedMove);

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
                gameRoom.emit('game_finished', {
                    ...elo,
                    reason: newGame.reason,
                    result: newGame.result,
                });

                this.liveGamesService.deleteGame(newGame.id);
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
            this.server.to(Rooms.game(game.id)).emit('game_finished', {
                ...elo,
                reason: game.reason,
                result: game.result,
            });

            this.liveGamesService.deleteGame(game.id);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.TIMEOUT)
    async handleTimeout(@ConnectedSocket() socket: TypedSocket) {
        const game = socket.data.currentGame;

        if (!game) throw new WsException('Game not found!');

        const result = await this.multiplayerService.timeout(game.id);

        if (result) {
            const { game, elo } = result;
            this.server.to(Rooms.game(game.id)).emit('game_finished', {
                reason: game.reason,
                result: game.result,
                ...elo,
            });

            this.liveGamesService.deleteGame(game.id);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.RQUEST_DRAW)
    async handleDrawRequest(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;
        const game = socket.data.currentGame;

        if (!game) throw new WsException('Game not found!');

        const newGame = await this.drawService.requestDraw(game.id, userId);

        if (newGame) {
            this.server.to(Rooms.game(newGame.id)).emit('draw_request', {
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

        const end = await this.drawService.draw(game.id, userId);

        if (end) {
            const { game, elo } = end;
            this.server.to(Rooms.game(game.id)).emit('game_finished', {
                reason: game.reason,
                result: game.result,
                ...elo,
            });

            this.liveGamesService.deleteGame(game.id);
        }
    }

    @SubscribeMessage(CLIENT_EVENTS.REJECT_DRAW)
    async handleDrawRejection(@ConnectedSocket() socket: TypedSocket) {
        const userId = socket.data.user.id;

        await this.drawService.rejectDraw(userId);
    }
}
