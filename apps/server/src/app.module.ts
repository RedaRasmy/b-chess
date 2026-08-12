import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from './auth/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule } from '@nestjs/config';
import { MultiplayerModule } from './multiplayer/multiplayer.module';
import { ProfileModule } from './profile/profile.module';
import { DatabaseModule } from './database/database.module';
import { GamesModule } from './games/games.module';
import { PlayersModule } from './players/players.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AuthModule.forRoot({
            auth,
        }),
        EventEmitterModule.forRoot(),
        ProfileModule,
        MultiplayerModule,
        GamesModule,
        PlayersModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
