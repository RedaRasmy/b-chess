import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
  OnGatewayDisconnect,
  WebSocketServer,
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
        status: 'disconnected',
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

    if (result.status === 'MATCH_FOUND') {
      result.players.forEach((userId) => {
        this.server
          .to(`user:${userId}`)
          .emit('game_found', { gameId: result.gameId });
      });
    } else {
      // socket.emit('queue_joined', { gameId: result.game.id });
    }
  }

  @SubscribeMessage('move')
  move(
    @MessageBody() moveDto: MoveDto,
    @ConnectedSocket() socket: TypedSocket,
  ) {}

  @SubscribeMessage('join_game')
  async joinGame(@ConnectedSocket() socket: TypedSocket) {
    const userId = socket.data.user.id;
    const ongoingGame = await this.multiplayerService.getOngoingGame(userId);

    if (ongoingGame) {
      socket.join(`game:${ongoingGame.id}`);
    }
  }

  @SubscribeMessage('sync_game')
  async sync(@ConnectedSocket() socket: TypedSocket) {
    const userId = socket.data.user.id;
    const ongoingGame = await this.multiplayerService.getOngoingGame(userId);

    if (ongoingGame) {
      this.server.to(`user:${userId}`).emit('current_state', ongoingGame);
    }
  }
}
