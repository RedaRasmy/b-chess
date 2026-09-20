'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Eye, EyeClosed, Key } from 'lucide-react';
import { ResetPasswordSchema, ResetPasswordCredentials } from '@/features/auth/validation';
import { authClient } from '@/lib/auth-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

                            {/* Password Field */}
                            <Controller
                                control={form.control}
                                name="password"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Choose new password"
                                                className="pl-10 pr-10"
                                                aria-invalid={fieldState.invalid}
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeClosed className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            {/* Confirm Password Field */}
                            <Controller
                                control={form.control}
                                name="confirmPassword"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="confirmPassword">
                                            Confirm Password
                                        </FieldLabel>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />

                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm the new password"
                                                className="pl-10 pr-10"
                                                aria-invalid={fieldState.invalid}
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeClosed className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
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
