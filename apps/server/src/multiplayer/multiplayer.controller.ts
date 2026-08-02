import { Controller, Get } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { GamesService } from '../games/games.service';

@Controller('multiplayer')
export class MultiplayerController {
    constructor(
        private readonly multiplayerService: MultiplayerService,
        private readonly gamesService: GamesService,
    ) {}

    @Get('isPlaying')
    async isPlaying(@Session() session: UserSession) {
        const ongoingGame = await this.gamesService.getCurrentGameWithPlayers(
            session.user.id,
        );

        const isPlaying = ongoingGame && ongoingGame.status !== 'finished';

        return {
            isPlaying,
        };
    }

    @Get('isMatching')
    async isMatching(@Session() session: UserSession) {
        const match = await this.gamesService.getMatch(session.user.id);

        return {
            isMatching: !!match,
        };
    }
}
