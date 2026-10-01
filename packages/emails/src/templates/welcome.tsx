import { Heading, Hr, Text } from 'react-email';
import { Layout } from '../components/layout';

export interface WelcomeEmailProps {}

export function WelcomeEmail({}: WelcomeEmailProps) {
    return (
        <Layout>
            <Heading className="text-2xl font-bold text-gray-900">
                Welcome to <span className="text-red-700">BChess</span>
            </Heading>
            <Text className="text-base text-gray-700">
                Start your journey in our online chess platform, challenge players around the world
                and level up.
            </Text>
            <Hr className="my-6 border-gray-200" />
            <Text className="text-xs text-gray-500">
                You received this because you created an account.
            </Text>
        </Layout>
    );
}

WelcomeEmail.PreviewProps = {} satisfies WelcomeEmailProps;

export default WelcomeEmail;
