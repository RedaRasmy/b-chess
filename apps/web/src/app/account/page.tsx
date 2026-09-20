'use client';
import AccountInfos from '@/features/profile/components/account-infos';
import UpdatePassword from '@/features/profile/components/change-password';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';

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
                <AccountInfos />
                {hasPassword && <UpdatePassword />}
            </div>
        </div>
    );
}
