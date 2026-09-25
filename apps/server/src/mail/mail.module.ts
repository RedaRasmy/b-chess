import { Module } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { MailProcessor } from './mail.processor.js';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'mail' }),
        BullBoardModule.forFeature({ name: 'mail', adapter: BullMQAdapter }),
    ],
    providers: [MailService, MailProcessor],
    exports: [MailService],
})
export class MailModule {}
