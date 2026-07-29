import { Module } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { MultiplayerGateway } from './multiplayer.gateway';
import { MultiplayerController } from './multiplayer.controller';

@Module({
    providers: [MultiplayerGateway, MultiplayerService],
    controllers: [MultiplayerController],
})
export class MultiplayerModule {}
