import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { OptionalAuth, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { PlayersService } from '../players/players.service.js';
import { GamesService } from '../games/games.service.js';
import type { Request, Response } from 'express';

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
        return await this.gamesService.getUserGames(session.user.id, page, limit);
    }

    /// Cookies Consent

    @OptionalAuth()
    @Post('consent')
    setConsent(@Body() body: { accepted: boolean }, @Res({ passthrough: true }) res: Response) {
        res.cookie('cookie_consent', body.accepted ? 'granted' : 'denied', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            path: '/',
        });
        return { ok: true };
    }

    @OptionalAuth()
    @Get('consent')
    getConsent(@Req() req: Request) {
        return { accepted: req.cookies?.cookie_consent === 'granted' };
    }
}
