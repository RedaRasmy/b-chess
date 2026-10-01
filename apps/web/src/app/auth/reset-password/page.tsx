'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordSchema, ResetPasswordCredentials } from '@/features/auth/validation';
import { authClient } from '@/lib/auth-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PasswordField } from '@/features/auth/components/password-field';

export default function LoginPage() {
    const form = useForm({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });
    const params = useSearchParams();
    const error = params.get('error');
    const token = params.get('token');

    if (!token) {
        form.setError('root', {
            message: 'Token is missing!',
        });
    }

    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async ({ password }: ResetPasswordCredentials) => {
            const { data: result, error } = await authClient.resetPassword({
                newPassword: password,
                token: token!,
            });
            if (error) throw error;
            return result;
        },
        onSuccess: async () => {
            toast.success('Password has been reset successfully', {
                richColors: true,
            });
            router.replace('/auth/login');
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong';

            form.setError('root', { message });
        },
    });

    async function onSubmit(data: ResetPasswordCredentials) {
        mutation.mutate(data);
    }

    const errors = form.formState.errors;
    const message = errors.root?.message ?? error ?? null;

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Update Password</CardTitle>
                        <CardDescription>Choose new password and submit.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <p className="text-red-500">{message}</p>

                            <PasswordField
                                control={form.control}
                                name={'password'}
                                label="New Password"
                                placeholder="Choose new password"
                            />

                            <PasswordField
                                control={form.control}
                                name={'confirmPassword'}
                                label="Confirm Password"
                                placeholder="Confirm the new password"
                            />

                            {/* Sign Up Button */}
                            <Button
                                type="submit"
                                size="lg"
                                className="cursor-pointer w-full mt-3"
                                disabled={mutation.isPending || token === null}
                            >
                                Submit
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
