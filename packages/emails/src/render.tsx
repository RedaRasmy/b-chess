import { render } from 'react-email';
import { WelcomeEmail, type WelcomeEmailProps } from './templates/welcome';
import ResetPasswordEmail, { ResetPasswordEmailProps } from './templates/reset-password';
import PasswordChangedEmail, { PasswordChangedProps } from './templates/password-changed';
import DeleteAccountEmail, { DeleteAccountProps } from './templates/delete-account';

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
        subject: 'Password Has Changed',
        html: await render(<PasswordChangedEmail {...props} />),
        text: await render(<PasswordChangedEmail {...props} />, { plainText: true }),
    };
}

export async function renderDeleteAccount(props: DeleteAccountProps) {
    return {
        subject: 'Request to delete account',
        html: await render(<DeleteAccountEmail {...props} />),
        text: await render(<DeleteAccountEmail {...props} />, { plainText: true }),
    };
}
