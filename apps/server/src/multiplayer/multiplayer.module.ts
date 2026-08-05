import { Module } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { MultiplayerGateway } from './multiplayer.gateway';
import { MultiplayerController } from './multiplayer.controller';
import { GamesService } from '../games/games.service';
import { PlayersService } from '../players/players.service';
import { LiveGamesService } from './live-games.service';
import { MatchmakingService } from './matchmaking.service';
import { MoveService } from './move.service';
import { DrawService } from './draw.service';

@Module({
    providers: [
        MultiplayerGateway,
        MultiplayerService,
        GamesService,
        PlayersService,
        LiveGamesService,
        MatchmakingService,
        MoveService,
        DrawService,
    ],
    controllers: [MultiplayerController],
})
export class MultiplayerModule {}
