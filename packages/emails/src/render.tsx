import { render } from 'react-email';
import { WelcomeEmail, type WelcomeEmailProps } from './templates/welcome';
// import { ResetPasswordEmail, type ResetPasswordEmailProps } from './templates/reset-password';

export async function renderWelcome(props: WelcomeEmailProps) {
    return {
        subject: 'Welcome to BChess!',
        html: await render(<WelcomeEmail {...props} />),
        text: await render(<WelcomeEmail {...props} />, { plainText: true }),
    };
}

// export async function renderResetPassword(props: ResetPasswordEmailProps) {
//   return {
//     subject: 'Reset your password',
//     html: await render(<ResetPasswordEmail {...props} />),
//     text: await render(<ResetPasswordEmail {...props} />, { plainText: true }),
//   };
// }
