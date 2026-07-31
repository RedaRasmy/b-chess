import { Controller, Get, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get('stats')
    async getStats(@Session() session: UserSession) {
        return await this.profileService.getStats(session);
    }

    @Get('/games')
    async getGames(
        @Session() session: UserSession,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return await this.profileService.getGames(session.user.id, page, limit);
    }
}
