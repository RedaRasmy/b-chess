import { Body, Container, Head, Html, Preview, Tailwind } from 'react-email';
import type { ReactNode } from 'react';

export function Layout({ preview, children }: { preview: string; children: ReactNode }) {
    return (
        <Html lang="en">
            <Head />
            <Preview>{preview}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-10 max-w-120 rounded-lg bg-white p-8">
                        {children}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
