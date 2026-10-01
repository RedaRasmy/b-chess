import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { TextField } from '@/features/auth/components/text-field';
import { getPasskeyName } from '@/features/auth/utils/passkey-utils';
import { authClient } from '@/lib/auth-client';
import { Passkey } from '@better-auth/passkey';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const RenamePasskeySchema = z.object({
    name: z.string().min(1, 'Passkey name is required').max(30, 'Max length is 30 characters'),
});

type RenamePasskeyData = z.infer<typeof RenamePasskeySchema>;

export default function RenamePasskeyDialog({ passkey }: { passkey: Passkey }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm({
        resolver: zodResolver(RenamePasskeySchema),
        defaultValues: {
            name: getPasskeyName(passkey),
        },
    });
    const updateMutation = useMutation({
        mutationFn: async ({ name }: RenamePasskeyData) => {
            const { data, error } = await authClient.passkey.updatePasskey({
                id: passkey.id,
                name,
            });
            if (error) throw error;

            return data;
        },
        onSuccess: async () => {
            toast.success('Passkey has been updated successfully', {
                richColors: true,
            });
            queryClient.invalidateQueries({
                queryKey: ['passkeys'],
            });
            setOpen(false);
        },
        onError: (err) => {
            const message = err.message || 'Something went wrong';
            toast.error(message);
        },
    });

    async function updatePasskey(data: RenamePasskeyData) {
        updateMutation.mutate(data);
    }

    function reset() {
        form.reset({ name: getPasskeyName(passkey) });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (next) reset();
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">Rename</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={form.handleSubmit(updatePasskey)}>
                    <DialogHeader>
                        <DialogTitle>Rename passkey</DialogTitle>
                        <DialogDescription>
                            Give this passkey a name that helps you recognize it later.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="mt-3 mb-5">
                        <TextField
                            control={form.control}
                            name="name"
                            label="Passkey Name"
                            placeholder='e.g. "MacBook Pro" or "My Phone"'
                            endAdornment={
                                <Button
                                    type="button"
                                    size={'icon-xs'}
                                    variant={'ghost'}
                                    onClick={reset}
                                >
                                    <RotateCcw />
                                </Button>
                            }
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending || !form.formState.isDirty}
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
