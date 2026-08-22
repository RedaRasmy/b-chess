import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Review',
};

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}
