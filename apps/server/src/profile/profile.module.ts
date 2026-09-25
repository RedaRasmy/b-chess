import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller.js';
import { PlayersService } from '../players/players.service.js';
import { GamesService } from '../games/games.service.js';

@Module({
    controllers: [ProfileController],
    providers: [PlayersService, GamesService],
})
export class ProfileModule {}
