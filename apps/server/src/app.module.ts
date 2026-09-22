import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule } from '@nestjs/config';
import { MultiplayerModule } from './multiplayer/multiplayer.module';
import { ProfileModule } from './profile/profile.module';
import { DatabaseModule } from './database/database.module';
import { GamesModule } from './games/games.module';
import { PlayersModule } from './players/players.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { createAuth } from './auth/auth';
import { BullModule } from '@nestjs/bullmq';
import IORedis from 'ioredis';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { MatchmakingService } from './multiplayer/matchmaking.service';
import { ResignService } from './multiplayer/resign.service';

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
            connection: new IORedis(process.env.REDIS_URL!, {
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
