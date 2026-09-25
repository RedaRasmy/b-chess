'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Key, Mail } from 'lucide-react';
import { EmailSchema, LoginCredentials, LoginSchema } from '@/features/auth/validation';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import GoogleButton from '@/features/auth/components/google-button';
import GithubButton from '@/features/auth/components/github-button';
import { PasswordField } from '@/features/auth/components/password-field';
import { TextField } from '@/features/auth/components/text-field';
import LastUsedBadge from '@/features/auth/components/last-used-badge';
import { CheckboxField } from '@/components/checkbox-field';

export default function LoginPage() {
    const form = useForm({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            emailOrUsername: '',
            password: '',
            rememberMe: true,
        },
    });
    const params = useSearchParams();
    const error = params.get('error');

    const wasGoogle = authClient.isLastUsedLoginMethod('google');
    const wasGithub = authClient.isLastUsedLoginMethod('github');
    const wasEmail = authClient.isLastUsedLoginMethod('email');
    const wasPasskey = authClient.isLastUsedLoginMethod('passkey');

    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (data: LoginCredentials) => {
            const isEmail = EmailSchema.safeParse(data.emailOrUsername).success;

            if (isEmail) {
                const { data: result, error } = await authClient.signIn.email({
                    email: data.emailOrUsername,
                    password: data.password,
                    rememberMe: data.rememberMe,
                });
                if (error) throw error;
                return result;
            } else {
                const { data: result, error } = await authClient.signIn.username({
                    username: data.emailOrUsername,
                    password: data.password,
                });
                if (error) throw error;
                return result;
            }
        },
        onSuccess: async () => {
            router.replace('/profile');
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong , Please try again.';
            form.setError('root', {
                message,
            });
        },
    });

    const passkeyMutation = useMutation({
        mutationFn: async () => {
            const { error } = await authClient.signIn.passkey({});

            if (error) {
                form.setError('root', {
                    message: error.message || 'Something went wrong, please try again.',
                });
                return;
            }

            router.replace('/profile');
        },
    });

    async function onSubmit(data: LoginCredentials) {
        mutation.mutate(data);
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
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>Sign in to your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <p className="text-red-500">{message}</p>

                            <TextField
                                label="Identifier"
                                control={form.control}
                                name="emailOrUsername"
                                icon={Mail}
                                placeholder="Enter your email or username"
                            />

                            <PasswordField
                                control={form.control}
                                name={'password'}
                                forgotPasswordHref="/auth/forgot-password"
                            />

                            <CheckboxField
                                control={form.control}
                                name="rememberMe"
                                label="Remember Me"
                                className="-mt-1"
                            />

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                className="w-full relative mt-3"
                                size="lg"
                                disabled={mutation.isPending}
                            >
                                Sign in
                                {wasEmail && <LastUsedBadge variant={'secondary'} />}
                            </Button>
                            {/* Passkey Button */}
                            <Button
                                type="button"
                                className="w-full relative -mt-1"
                                variant={'outline'}
                                size="lg"
                                disabled={passkeyMutation.isPending}
                                onClick={() => passkeyMutation.mutate()}
                            >
                                <Key />
                                Use Passkey
                                {wasPasskey && <LastUsedBadge className="top-1/1" />}
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
                            <GoogleButton isLastUsed={wasGoogle} />
                            <GithubButton isLastUsed={wasGithub} />
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
