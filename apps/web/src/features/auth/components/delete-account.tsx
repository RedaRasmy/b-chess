import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
('@/components/ui/item');
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
import { useState } from 'react';

export default function DeleteAccount() {
    const [success, setSuccess] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await authClient.deleteUser({
                callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/auth/goodbye`,
            });
            if (error) throw error;

            return data;
        },
        onSuccess: async () => {
            setSuccess('A verification email was sent, check your email inbox to proceed.');
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong';
            toast.error(message);
            setSuccess(null);
        },
    });

    async function deleteAccount() {
        mutation.mutate();
    }

    return (
        <Card className="shadow-xl w-full border-primary">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">Delete Account!</CardTitle>
                <CardDescription className="text-green-500">{success}</CardDescription>
            </CardHeader>
            <CardContent className="mx-auto">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="lg" className="min-w-50">
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                All your account data will be deleted except played games will
                                remain anonymously.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={deleteAccount}
                                disabled={mutation.isPending}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
