import { Controller, Get, Query } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { PlayersService } from '../players/players.service';
import { GamesService } from '../games/games.service';

@Controller('profile')
export class ProfileController {
    constructor(
        private readonly playersService: PlayersService,
        private readonly gamesService: GamesService,
    ) {}

    @Get('stats')
    async getStats(@Session() session: UserSession) {
        return await this.playersService.getUserStats(session.user.id);
    }

    @Get('games')
    async getGames(
        @Session() session: UserSession,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return await this.gamesService.getUserGames(
            session.user.id,
            page,
            limit,
        );
    }
}
