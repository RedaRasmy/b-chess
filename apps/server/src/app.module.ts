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
            imports: [MailModule],
            inject: [MailService],
            useFactory: (mail: MailService) => ({ auth: createAuth({ mail }) }),
        }),
        EventEmitterModule.forRoot(),
        ProfileModule,
        MultiplayerModule,
        GamesModule,
        PlayersModule,
        MailModule,
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
