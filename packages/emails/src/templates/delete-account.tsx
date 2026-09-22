import { Heading, Hr, Text, Button } from 'react-email';
import { Layout } from '../components/layout';

export interface DeleteAccountProps {
    url: string;
}

export function DeleteAccountEmail({ url }: DeleteAccountProps) {
    return (
        <Layout>
            <Heading className="text-2xl font-bold text-red-700">Delete Your Account!</Heading>
            <ul>
                <li>You won't be able to log in anymore</li>
                <li>this action is irreversible</li>
                <li>
                    All account data will be deleted except the games you have played will remain
                    anonymously
                </li>
            </ul>
            <Text className="text-base text-gray-700 flex flex-col">
                If you are sure and want to proceed, click the button bellow:
                <br />
                <Button
                    href={url}
                    className="bg-red-700 px-3 py-1 mt-4 w-fit self-center text-white rounded-xl"
                >
                    Delete Account
                </Button>
            </Text>
            <Hr className="my-6 border-gray-200" />
            <Text className="text-xs text-gray-500">This link will be invalid in few minutes.</Text>
        </Layout>
    );
}

DeleteAccountEmail.PreviewProps = {
    url: 'http://localhost:3000/auth/goodbye',
} satisfies DeleteAccountProps;

export default DeleteAccountEmail;
