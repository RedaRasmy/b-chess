import { Body, Container, Head, Html, Tailwind } from 'react-email';
import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
    return (
        <Html lang="en">
            <Head />
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-10 max-w-xl rounded-lg bg-white p-4">
                        {children}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
