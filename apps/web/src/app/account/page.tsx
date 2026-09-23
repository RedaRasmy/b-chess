'use client';
import AccountInfos from '@/features/profile/components/account-infos';
import Passkeys from '@/features/auth/components/passkeys';
import UpdatePassword from '@/features/auth/components/change-password';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import DeleteAccount from '@/features/auth/components/delete-account';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
    // const { data: accountInfos } = useQuery({
    //     queryKey: ['account'],
    //     queryFn: () => authClient.accountInfo(),
    // });

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => authClient.listAccounts(),
    });

    const hasPassword = accounts?.data?.some((a) => a.providerId === 'credential') ?? false;

    // console.log({ hasPassword, accounts });

    return (
        <div className="flex flex-col items-center overflow-auto gap-3 lg:gap-5 py-2 lg:py-4">
            <div className="container lg:max-w-xl space-y-2 md:space-y-3">
                <Link href="/profile">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Profile
                    </Button>
                </Link>
                <AccountInfos />
                {hasPassword && <UpdatePassword />}
                <Passkeys />
                <DeleteAccount />
            </div>
        </div>
    );
}
