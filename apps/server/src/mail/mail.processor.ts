import { renderWelcome } from '@bchess/emails';
import { Resend } from 'resend';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('mail', {
    drainDelay: 30,
    stalledInterval: 120000,
})
export class MailProcessor extends WorkerHost {
    private readonly resend = new Resend(process.env.RESEND_API_KEY);
    private readonly logger = new Logger(MailProcessor.name);
    private readonly from = `BChess <no-reply@${process.env.MAIL_DOMAIN}>`;

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`Job ${job.id} (${job.name}) completed`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job | undefined, err: Error) {
        this.logger.error(
            `Job ${job?.id} (${job?.name}) failed, attempt ${job?.attemptsMade}: ${err.message}`,
        );
    }

    async process(job: Job) {
        if (job.name === 'welcome') {
            const { to } = job.data;
            const { subject, html, text } = await renderWelcome({});
            const { error } = await this.resend.emails.send(
                {
                    from: this.from,
                    to,
                    subject,
                    html,
                    text,
                },
                {
                    idempotencyKey: `welcome-${to}`,
                },
            );
            if (error) throw new Error(error.message); // throwing triggers a retry
        }
    }
}
