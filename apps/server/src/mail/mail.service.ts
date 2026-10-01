import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

const JOB_OPTS = {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
} as const;

@Injectable()
export class MailService {
    constructor(@InjectQueue('mail') private queue: Queue) {}

    private async enqueue(name: string, data: Record<string, string>): Promise<void> {
        if (process.env.E2E === 'true') return;
        await this.queue.add(name, data, JOB_OPTS);
    }

    sendWelcome(to: string) {
        return this.enqueue('welcome', { to });
    }

    sendResetPassword(to: string, url: string) {
        return this.enqueue('password-reset', { to, url });
    }

    sendPasswordChanged(to: string) {
        return this.enqueue('password-changed', { to });
    }

    sendDeleteAccount(to: string, url: string) {
        return this.enqueue('delete-account', { to, url });
    }
}
