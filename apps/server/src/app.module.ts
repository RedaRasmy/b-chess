import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule } from '@nestjs/config';
import { MultiplayerModule } from './multiplayer/multiplayer.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { DatabaseModule } from './database/database.module.js';
import { GamesModule } from './games/games.module.js';
import { PlayersModule } from './players/players.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './mail/mail.module.js';
import { MailService } from './mail/mail.service.js';
import { createAuth } from './auth/auth.js';
import { BullModule } from '@nestjs/bullmq';
import { Redis } from 'ioredis';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { MatchmakingService } from './multiplayer/matchmaking.service.js';
import { ResignService } from './multiplayer/resign.service.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ],
        }),
        DatabaseModule,
        AuthModule.forRootAsync({
            imports: [MailModule, MultiplayerModule],
            inject: [MailService, MatchmakingService, ResignService],
            useFactory: (
                mail: MailService,
                matchmakingService: MatchmakingService,
                resignService: ResignService,
            ) => ({
                auth: createAuth({ mail, matchmakingService, resignService }),
            }),
        }),
        EventEmitterModule.forRoot(),
        ProfileModule,
        MultiplayerModule,
        GamesModule,
        PlayersModule,
        MailModule,
        BullModule.forRoot({
            connection: new Redis(process.env.REDIS_URL!, {
                maxRetriesPerRequest: null, // required by BullMQ workers when you pass your own connection
            }),
        }),
        BullBoardModule.forRoot({
            route: '/queues',
            adapter: ExpressAdapter,
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
