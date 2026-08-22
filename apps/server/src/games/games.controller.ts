import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { GamesService } from './games.service';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Get('/:id')
    @OptionalAuth()
    async getFullGame(@Param('id') id: string) {
        const game = await this.gamesService.getFullGameById(id);

        if (!game) throw new NotFoundException('Game not found!');

        return game;
    }
}
