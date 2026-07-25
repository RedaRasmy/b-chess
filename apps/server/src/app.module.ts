import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from './auth/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule } from '@nestjs/config';
import { MultiplayerModule } from './multiplayer/multiplayer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule.forRoot({
      auth,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
