import { Module } from '@nestjs/common';
import { PlayersService } from './players.service.js';
import { PlayersController } from './players.controller.js';

@Module({
    controllers: [PlayersController],
    providers: [PlayersService],
})
export class PlayersModule {}
