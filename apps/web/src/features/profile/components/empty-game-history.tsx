import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function EmptyGameHistory() {
    return (
        <div className="mx-auto flex w-full lg:w-xl xl:w-2xl flex-col items-center gap-5 rounded-lg border border-dashed bg-card/50 px-6 py-14 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ChessboardGlyph className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold">No games yet</h3>
                <p className="max-w-[26ch] text-sm text-muted-foreground">
                    Your match history will show up here once you&apos;ve played your first game.
                </p>
            </div>

            <Button size="sm" asChild className="mt-1">
                <Link href={'/multiplayer'}>Play your first game</Link>
            </Button>
        </div>
    );
}

function ChessboardGlyph({ className }: { className?: string }) {
    const cells = Array.from({ length: 16 }, (_, i) => i);
    return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
            {cells.map((i) => {
                const row = Math.floor(i / 4);
                const col = i % 4;
                const isDark = (row + col) % 2 === 1;
                return (
                    <rect
                        key={i}
                        x={col * 8}
                        y={row * 8}
                        width={8}
                        height={8}
                        fill="currentColor"
                        opacity={isDark ? 0.9 : 0.25}
                    />
                );
            })}
        </svg>
    );
}
