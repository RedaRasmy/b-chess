import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { PlayersService } from '../players/players.service';
import { GamesService } from '../games/games.service';

@Module({
    controllers: [ProfileController],
    providers: [PlayersService, GamesService],
})
export class ProfileModule {}
