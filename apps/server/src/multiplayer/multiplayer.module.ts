import { Module } from '@nestjs/common';
import { ResignService } from './resign.service';
import { MultiplayerGateway } from './multiplayer.gateway';
import { MultiplayerController } from './multiplayer.controller';
import { GamesService } from '../games/games.service';
import { PlayersService } from '../players/players.service';
import { LiveGamesService } from './live-games.service';
import { MatchmakingService } from './matchmaking.service';
import { MoveService } from './move.service';
import { DrawService } from './draw.service';
import { TimerService } from './timer.service';

@Module({
    providers: [
        MultiplayerGateway,
        ResignService,
        GamesService,
        PlayersService,
        LiveGamesService,
        MatchmakingService,
        MoveService,
        DrawService,
        TimerService
    ],
    controllers: [MultiplayerController],
})
export class MultiplayerModule {}
