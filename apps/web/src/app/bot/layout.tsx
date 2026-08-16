'use client';
import { ReactNode, useEffect } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
    useEffect(() => {
        fetch('/stockfish.js').catch(() => {});
        fetch('/stockfish.wasm').catch(() => {});
    }, []);
    return children;
}
