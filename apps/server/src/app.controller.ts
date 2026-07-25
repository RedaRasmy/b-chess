import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  @OptionalAuth()
  health(): string {
    return this.appService.getHealth();
  }
}
