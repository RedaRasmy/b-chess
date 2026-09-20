import { Heading } from 'react-email';
import { Layout } from '../components/layout';

export interface PasswordChangedProps {}

export function PasswordChangedEmail({}: PasswordChangedProps) {
    return (
        <Layout preview={`Password Changed`}>
            <Heading className="text-2xl font-bold text-gray-900">
                Your Password has been updated successfully!
            </Heading>
        </Layout>
    );
}

PasswordChangedEmail.PreviewProps = {} satisfies PasswordChangedProps;

export default PasswordChangedEmail;
