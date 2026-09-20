import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { UpdatePasswordData, UpdatePasswordSchema } from '@/features/auth/validation';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeClosed, Key } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function UpdatePassword() {
    const form = useForm({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            currentPassword: '',
            password: '',
            confirmPassword: '',
        },
    });

    const mutation = useMutation({
        mutationFn: async ({ currentPassword, password }: UpdatePasswordData) => {
            const { data, error } = await authClient.changePassword({
                currentPassword,
                newPassword: password,
                revokeOtherSessions: true,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: async () => {
            toast.success('Password has been updated successfully', {
                richColors: true,
            });
            form.reset();
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong';

            form.setError('root', { message });
        },
    });

    async function onSubmit(data: UpdatePasswordData) {
        mutation.mutate(data);
    }

    const errors = form.formState.errors;
    const message = errors.root?.message ?? null;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <Card className="shadow-xl w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
                <CardDescription>You will be logged out of all other devices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <p className="text-red-500">{message}</p>
                    {/* Current Password Field */}
                    <Controller
                        control={form.control}
                        name="currentPassword"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="password">Current Password</FieldLabel>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your valid password"
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
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* New Password Field */}
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
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* Confirm Password Field */}
                    <Controller
                        control={form.control}
                        name="confirmPassword"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
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
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeClosed className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        className="cursor-pointer w-full mt-3"
                        disabled={mutation.isPending}
                    >
                        Submit
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
