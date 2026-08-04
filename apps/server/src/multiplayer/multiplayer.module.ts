import { Module } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { MultiplayerGateway } from './multiplayer.gateway';
import { MultiplayerController } from './multiplayer.controller';
import { GamesService } from '../games/games.service';
import { PlayersService } from '../players/players.service';
import { LiveGamesService } from './live-games.service';

@Module({
    providers: [
        MultiplayerGateway,
        MultiplayerService,
        GamesService,
        PlayersService,
        LiveGamesService,
    ],
    controllers: [MultiplayerController],
})
export class MultiplayerModule {}
