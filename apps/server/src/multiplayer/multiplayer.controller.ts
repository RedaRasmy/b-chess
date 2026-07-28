import { Controller, Get } from '@nestjs/common';
import { MultiplayerService } from './multiplayer.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('multiplayer')
export class MultiplayerController {
  constructor(private readonly multiplayerService: MultiplayerService) {}

  @Get('isPlaying')
  async isPlaying(@Session() session: UserSession) {
    const ongoingGame = await this.multiplayerService.getOngoingGame(
      session.user.id,
    );

    return {
      isPlaying: !!ongoingGame,
    };
  }
}
