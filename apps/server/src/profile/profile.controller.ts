import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('stats')
  getStats(@Session() session: UserSession) {
    return this.profileService.getStats(session);
  }
}
