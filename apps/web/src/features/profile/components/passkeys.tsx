import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAuthenticatorName, Passkey } from '@better-auth/passkey';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Passkeys() {
    const queryClient = useQueryClient();
    const { data: passkeys } = useQuery({
        queryKey: ['passkeys'],
        queryFn: async () => await authClient.passkey.listUserPasskeys(),
    });

    const registerMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await authClient.passkey.addPasskey({
                returnWebAuthnResponse: true,
            });
            if (error) throw error;

            return data;
        },
        onSuccess: async () => {
            toast.success('Passkey has been registered successfully', {
                richColors: true,
            });
            queryClient.invalidateQueries({
                queryKey: ['passkeys'],
            });
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong';
            toast.error(message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await authClient.passkey.deletePasskey({
                id,
            });
            if (error) throw error;

            return data;
        },
        onSuccess: async () => {
            toast.success('Passkey has been deleted successfully', {
                richColors: true,
            });
            queryClient.invalidateQueries({
                queryKey: ['passkeys'],
            });
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong';
            toast.error(message);
        },
    });

    async function registerPasskey() {
        registerMutation.mutate();
    }

    async function deletePasskey(id: string) {
        deleteMutation.mutate(id);
    }

    function getPasskeyName(passkey: Passkey) {
        return passkey.name || getAuthenticatorName(passkey.aaguid) || 'Passkey';
    }

    return (
        <Card className="shadow-xl w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Passkeys</CardTitle>
                <CardDescription>Register a passkey to sign in quickly.</CardDescription>
            </CardHeader>
            <CardContent className="">
                {passkeys?.data?.map((passkey) => (
                    <Item variant="outline" key={passkey.id}>
                        <ItemContent>
                            <ItemTitle>{getPasskeyName(passkey)}</ItemTitle>
                            <ItemDescription>
                                Added {passkey.createdAt.toDateString()}
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You will no longer be able to use this passkey.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => deletePasskey(passkey.id)}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </ItemActions>
                    </Item>
                ))}
                <Button
                    onClick={registerPasskey}
                    size="lg"
                    className="w-full mt-3"
                    disabled={registerMutation.isPending}
                >
                    Add Passkey
                </Button>
            </CardContent>
        </Card>
    );
}
