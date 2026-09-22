'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail } from 'lucide-react';
import { ForgotPasswordSchema, ForgotPasswordCredentials } from '@/features/auth/validation';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import GoogleButton from '@/features/auth/components/google-button';
import GithubButton from '@/features/auth/components/github-button';
import { TextField } from '@/features/auth/components/text-field';

export default function Page() {
    const form = useForm({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });
    const params = useSearchParams();
    const error = params.get('error');

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (email: string) => {
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
            });

            if (error) throw error;
        },
        onSuccess: async () => {
            setSuccessMessage('Check the sent email to proceed.');
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong , Please try again.';
            form.setError('root', {
                message,
            });
            setSuccessMessage(null);
        },
    });

    async function onSubmit(data: ForgotPasswordCredentials) {
        mutation.mutate(data.email);
    }

    const errors = form.formState.errors;
    const message = errors.root?.message ?? error ?? null;

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home */}
                <Link href="/">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                        <CardDescription>Enter your email to reset your password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <p className="text-red-500">{message}</p>
                            <p className="text-green-500">{successMessage}</p>

                            <TextField
                                control={form.control}
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="name@example.com"
                                icon={Mail}
                            />

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                className="w-full cursor-pointer mt-3"
                                size="lg"
                                disabled={mutation.isPending}
                            >
                                Send Email
                            </Button>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or sign in with
                                </span>
                            </div>
                        </div>

                        {/* OAuth Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <GoogleButton />
                            <GithubButton />
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">
                                Don&apos;t have an account?
                            </span>
                            <Link href="/auth/register">
                                <Button variant={'link'}>Sign up</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
