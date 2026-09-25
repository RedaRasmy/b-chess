'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, User } from 'lucide-react';
import { RegisterSchema, RegisterCredentials } from '@/features/auth/validation';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import GoogleButton from '@/features/auth/components/google-button';
import GithubButton from '@/features/auth/components/github-button';
import { TextField } from '@/features/auth/components/text-field';
import { PasswordField } from '@/features/auth/components/password-field';

export default function LoginPage() {
    const form = useForm({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });
    const params = useSearchParams();
    const error = params.get('error');

    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (data: RegisterCredentials) => {
            const { data: result, error } = await authClient.signUp.email({
                name: data.username,
                email: data.email,
                password: data.password,
                username: data.username,
            });
            if (error) throw error;
            return result;
        },
        onSuccess: async () => {
            router.replace('/profile');
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong';

            if (message.toLowerCase().includes('username')) {
                form.setError('username', { message });
            } else if (message.toLowerCase().includes('email')) {
                form.setError('email', { message });
            } else {
                form.setError('root', { message });
            }
        },
    });

    async function onSubmit(data: RegisterCredentials) {
        mutation.mutate(data);
    }

    const errors = form.formState.errors;
    const message = errors.root?.message ?? error ?? null;

    const wasGoogle = authClient.isLastUsedLoginMethod('google');
    const wasGithub = authClient.isLastUsedLoginMethod('github');

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home */}
                <Link href="/" className="inline-block mb-6">
                    <Button variant="ghost">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                        <CardDescription>Join us today and start your journey</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <p className="text-red-500">{message}</p>

                            {/* Username Field */}
                            <TextField
                                control={form.control}
                                name="username"
                                label="Username"
                                placeholder="Enter your username"
                                icon={User}
                            />

                            {/* Email Field */}
                            <TextField
                                control={form.control}
                                name="email"
                                type="email"
                                label="Email"
                                placeholder="Enter your email"
                                icon={Mail}
                            />

                            {/* Password Field */}
                            <PasswordField
                                control={form.control}
                                name={'password'}
                                placeholder="Create a password"
                            />

                            {/* Confirm Password Field */}
                            <PasswordField
                                control={form.control}
                                name={'confirmPassword'}
                                label="Confirm Password"
                                placeholder="Confirm your password"
                            />

                            {/* Sign Up Button */}
                            <Button
                                type="submit"
                                size="lg"
                                className="cursor-pointer w-full mt-3"
                                disabled={mutation.isPending}
                            >
                                Create Account
                            </Button>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        {/* OAuth Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <GoogleButton isLastUsed={wasGoogle} />
                            <GithubButton isLastUsed={wasGithub} />
                        </div>

                        {/* Sign In Link */}
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Already have an account?</span>
                            <Link href="/auth/login">
                                <Button variant={'link'}>Sign in</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
