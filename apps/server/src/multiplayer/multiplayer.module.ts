import { Module } from '@nestjs/common';
import { ResignService } from './resign.service.js';
import { MultiplayerGateway } from './multiplayer.gateway.js';
import { MultiplayerController } from './multiplayer.controller.js';
import { GamesService } from '../games/games.service.js';
import { PlayersService } from '../players/players.service.js';
import { LiveGamesService } from './live-games.service.js';
import { MatchmakingService } from './matchmaking.service.js';
import { MoveService } from './move.service.js';
import { DrawService } from './draw.service.js';
import { TimerService } from './timer.service.js';

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
        TimerService,
    ],
    controllers: [MultiplayerController],
    exports: [MatchmakingService, ResignService],
})
export class MultiplayerModule {}
