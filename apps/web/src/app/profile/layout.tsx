import LoadingPage from '@/components/loading-page';
import UserProvider from '@/features/profile/components/user-provider';
import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profile',
};

export default function Layout({ children }: { children: ReactNode }) {
    return <UserProvider fallback={<LoadingPage />}>{children}</UserProvider>;
}
