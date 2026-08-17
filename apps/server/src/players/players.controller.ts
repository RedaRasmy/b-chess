import { Controller, Get, Query } from '@nestjs/common';
import { PlayersService } from './players.service';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';

@Controller('players')
export class PlayersController {
    constructor(private readonly playersService: PlayersService) {}

    @Get('top')
    @OptionalAuth()
    async getTopPlayers(@Query('page') page: number, @Query('limit') limit: number) {
        return await this.playersService.getTopPlayers(page, limit);
    }
}
