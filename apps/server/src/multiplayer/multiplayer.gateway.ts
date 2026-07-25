import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { MultiplayerService } from './multiplayer.service';
import { CreateMultiplayerDto } from './dto/create-multiplayer.dto';
import { UpdateMultiplayerDto } from './dto/update-multiplayer.dto';
import { Socket } from 'socket.io';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/auth';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MultiplayerGateway implements OnGatewayConnection {
  constructor(private readonly multiplayerService: MultiplayerService) {}

  async handleConnection(client: Socket) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(client.handshake.headers),
    });

    if (!session) {
      client.disconnect();
      return;
    }

    client.data.user = session.user;
  }

  @SubscribeMessage('createMultiplayer')
  create(@MessageBody() createMultiplayerDto: CreateMultiplayerDto) {
    return this.multiplayerService.create(createMultiplayerDto);
  }

  @SubscribeMessage('findAllMultiplayer')
  findAll() {
    return this.multiplayerService.findAll();
  }

  @SubscribeMessage('findOneMultiplayer')
  findOne(@MessageBody() id: number) {
    return this.multiplayerService.findOne(id);
  }

  @SubscribeMessage('updateMultiplayer')
  update(@MessageBody() updateMultiplayerDto: UpdateMultiplayerDto) {
    return this.multiplayerService.update(
      updateMultiplayerDto.id,
      updateMultiplayerDto,
    );
  }

  @SubscribeMessage('removeMultiplayer')
  remove(@MessageBody() id: number) {
    return this.multiplayerService.remove(id);
  }
}
