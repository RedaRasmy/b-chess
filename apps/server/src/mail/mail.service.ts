import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { renderWelcome } from '@bchess/emails';

@Injectable()
export class MailService {
    private resend = new Resend(process.env.RESEND_API_KEY);

    async sendWelcome(to: string) {
        const { subject, html, text } = await renderWelcome({});
        await this.resend.emails.send({
            from: `BChess <no-reply@${process.env.MAIL_DOMAIN}>`,
            to,
            subject,
            html,
            text,
        });
    }
}
