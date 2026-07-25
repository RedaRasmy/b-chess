import { Module } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { MultiplayerGateway } from './multiplayer.gateway';

@Module({
  providers: [MultiplayerGateway, MultiplayerService],
})
export class MultiplayerModule {}
