import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
  OnGatewayDisconnect,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { MultiplayerService } from './multiplayer.service';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/auth';
import { MoveDto } from './dto/move.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { ClientToServerEvents, ServerToClientEvents } from '@bchess/shared';
import { UserSession } from '@thallesp/nestjs-better-auth';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  {
    user: UserSession['user'];
  }
>;

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

    const ongoingGame = await this.multiplayerService.getOngoingGame(user.id);

    if (ongoingGame) {
      const opponentId =
        ongoingGame.whiteId === user.id
          ? ongoingGame.blackId!
          : ongoingGame.whiteId;

      socket.join(`game:${ongoingGame.id}`);
      this.server.to(`user:${opponentId}`).emit('opponent_status_changed', {
        status: 'connected',
      });
    }
  }

  async handleDisconnect(socket: TypedSocket) {
    const userId = socket.data.user.id;
    const ongoingGame = await this.multiplayerService.getOngoingGame(userId);

    if (ongoingGame) {
      const opponentId =
        ongoingGame.whiteId === userId
          ? ongoingGame.blackId!
          : ongoingGame.whiteId;

      this.server.to(`user:${opponentId}`).emit('opponent_status_changed', {
        status: 'disconnected',
      });
    }
  }

  @SubscribeMessage('join_queue')
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
        this.server.to(`user:${userId}`).emit('game_found', result.game);
      });
    } else {
      socket.emit('queue_joined', { gameId: result.game.id });
    }
  }

  @SubscribeMessage('cancel_match')
  async handleCancelMatch(@ConnectedSocket() socket: TypedSocket) {
    await this.multiplayerService.deleteMatch(socket.data.user.id);
    console.log('match deleted');
  }

  @SubscribeMessage('join_game')
  async joinGame(@ConnectedSocket() socket: TypedSocket) {
    const userId = socket.data.user.id;
    const ongoingGame = await this.multiplayerService.getOngoingGame(userId);

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
        .emit('current_state', {
          ...newGame,
          white: ongoingGame.white,
          black: ongoingGame.black,
        });
    } else {
      this.server.to(`user:${userId}`).emit('current_state', ongoingGame);
    }
  }

  @SubscribeMessage('move')
  move(
    @MessageBody() moveDto: MoveDto,
    @ConnectedSocket() socket: TypedSocket,
  ) {}

  @SubscribeMessage('sync_game')
  async sync(@ConnectedSocket() socket: TypedSocket) {
    const userId = socket.data.user.id;
    const ongoingGame = await this.multiplayerService.getOngoingGame(userId);

    if (ongoingGame) {
      this.server.to(`user:${userId}`).emit('current_state', ongoingGame);
    }
  }

  @SubscribeMessage('resign')
  async handleResign(@ConnectedSocket() socket: TypedSocket) {
    const userId = socket.data.user.id;

    const finishedGame = await this.multiplayerService.resign(userId);

    if (finishedGame) {
      this.server
        .to(`game:${finishedGame.id}`)
        .emit('current_state', finishedGame);
    }
  }

  @SubscribeMessage('timeout')
  async handleTimeout(@ConnectedSocket() socket: TypedSocket) {
    const userId = socket.data.user.id;

    const finishedGame = await this.multiplayerService.timeout(userId);

    if (finishedGame) {
      this.server
        .to(`game:${finishedGame.id}`)
        .emit('current_state', finishedGame);
    }
  }
}
