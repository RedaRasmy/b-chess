import { Heading, Hr, Text, Button } from 'react-email';
import { Layout } from '../components/layout';

export interface ResetPasswordEmailProps {
    url: string;
}

export function ResetPasswordEmail({ url }: ResetPasswordEmailProps) {
    return (
        <Layout>
            <Heading className="text-2xl font-bold text-gray-900">
                Reset your password in few steps
            </Heading>
            <Text className="text-base text-gray-700">
                <span className="text-500 text-">
                    If it's not you who requested it you can just ignore it.
                </span>
                <br />
                To proceed click the button bellow:
                <br />
                <Button href={url} className="bg-red-700 px-3 py-1 mt-2 text-white rounded-xl">
                    Reset Password
                </Button>
            </Text>
            <Hr className="my-6 border-gray-200" />
            <Text className="text-xs text-gray-500">This link will be invalid in few minutes.</Text>
        </Layout>
    );
}

ResetPasswordEmail.PreviewProps = {
    url: 'http://localhost:3000/auth/reset-password',
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail;
