import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordField } from '@/features/auth/components/password-field';
import { UpdatePasswordData, UpdatePasswordSchema } from '@/features/auth/validation';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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

    return (
        <Card className="shadow-xl w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
                <CardDescription>You will be logged out of all other devices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <p className="text-red-500">{message}</p>

                    <PasswordField
                        control={form.control}
                        name={'currentPassword'}
                        label="Current Password"
                        placeholder="Enter your valid password"
                    />

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
