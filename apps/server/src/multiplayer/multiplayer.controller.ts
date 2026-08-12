import { Controller, Get } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { GamesService } from '../games/games.service';
import { MatchmakingService } from './matchmaking.service';

@Controller('multiplayer')
export class MultiplayerController {
    constructor(
        private readonly gamesService: GamesService,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    @Get('isPlaying')
    async isPlaying(@Session() session: UserSession) {
        const ongoingGame = await this.gamesService.getFullCurrentGame(
            session.user.id,
        );

        const isPlaying = ongoingGame && ongoingGame.status !== 'finished';

        return {
            isPlaying,
        };
    }

    @Get('isMatching')
    async isMatching(@Session() session: UserSession) {
        const match = await this.matchmakingService.getMatch(session.user.id);

        return {
            isMatching: !!match,
        };
    }
}
