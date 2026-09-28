'use client';
import { CheckboxField } from '@/components/checkbox-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApprovalLabel from '@/features/auth/components/approval-label';
import { TextField } from '@/features/auth/components/text-field';
import { OnboardingData, OnboardingSchema } from '@/features/auth/validation';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function Page() {
    const form = useForm({
        resolver: zodResolver(OnboardingSchema),
        defaultValues: {
            username: '',
            approval: false,
        },
    });
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async ({ username }: OnboardingData) => {
            const { data: availability } = await authClient.isUsernameAvailable({ username });

            if (!availability?.available) {
                throw new Error('Username is already taken. Please try another.');
            }
            const { data: result, error } = await authClient.updateUser({
                username,
            });

            if (error) throw error;
            return result;
        },
        onSuccess: () => router.replace('/profile'),
        onError: (err) => {
            form.setError('username', {
                message: err.message ?? 'Semething went wrong',
            });
        },
    });

    async function onSubmit(data: OnboardingData) {
        mutation.mutate(data);
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">One last step</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <TextField
                                control={form.control}
                                name="username"
                                label="Username"
                                placeholder="Choose a username"
                                icon={User}
                            />

                            <CheckboxField
                                control={form.control}
                                name="approval"
                                label={<ApprovalLabel />}
                            />

                            <Button
                                type="submit"
                                className="w-full cursor-pointer mt-3"
                                size="lg"
                                disabled={mutation.isPending}
                            >
                                Continue
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
