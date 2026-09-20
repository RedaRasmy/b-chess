import { render } from 'react-email';
import { WelcomeEmail, type WelcomeEmailProps } from './templates/welcome';
import ResetPasswordEmail, { ResetPasswordEmailProps } from './templates/reset-password';
import PasswordChangedEmail, { PasswordChangedProps } from './templates/password-changed';

export async function renderWelcome(props: WelcomeEmailProps) {
    return {
        subject: 'Welcome to BChess!',
        html: await render(<WelcomeEmail {...props} />),
        text: await render(<WelcomeEmail {...props} />, { plainText: true }),
    };
}

export async function renderResetPassword(props: ResetPasswordEmailProps) {
    return {
        subject: 'Request to reset password',
        html: await render(<ResetPasswordEmail {...props} />),
        text: await render(<ResetPasswordEmail {...props} />, { plainText: true }),
    };
}

export async function renderPasswordChanged(props: PasswordChangedProps) {
    return {
        subject: 'Password Changed',
        html: await render(<PasswordChangedEmail {...props} />),
        text: await render(<PasswordChangedEmail {...props} />, { plainText: true }),
    };
}
