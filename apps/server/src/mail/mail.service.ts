import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
    constructor(@InjectQueue('mail') private queue: Queue) {}

    sendWelcome(to: string) {
        return this.queue.add(
            'welcome',
            { to },
            {
                attempts: 5,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: 1000,
                removeOnFail: 5000,
            },
        );
    }
}
