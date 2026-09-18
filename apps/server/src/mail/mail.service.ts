import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
// import { render } from '@react-email/render';
// import { WelcomeEmail } from './templates/welcome-email';

@Injectable()
export class MailService {
    private resend = new Resend(process.env.RESEND_API_KEY);

    async sendWelcome(to: string) {
        // const html = await render(WelcomeEmail({ name }));
        await this.resend.emails.send({
            from: `BChess <welcome@${process.env.MAIL_DOMAIN}>`,
            to,
            subject: 'Welcome to BChess!',
            html: 'Start your journey in our online chess platform, challenge players around the world and level up.',
        });
    }
}
