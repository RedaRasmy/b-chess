import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useGameStore } from '@/features/game/game-store';
import { cn } from '@/lib/utils';
import { Frown, Handshake, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function MultiplayerEndDialog() {
    const results = useGameStore((s) => s.results);
    const playerColor = useGameStore((s) => s.players?.playerColor);

    if (!results || !playerColor) return null;

    const { result, reason, blackEloDiff, whiteEloDiff } = results;

    const isDraw = result === 'draw';
    const isWin = result === `${playerColor}_won`;

    const playerEloDiff = playerColor === 'white' ? whiteEloDiff : blackEloDiff;

    const outcome = isDraw
        ? {
              title: 'You Draw',
              icon: Handshake,
              accent: 'text-muted-foreground',
              ring: 'ring-border',
          }
        : isWin
          ? {
                title: 'You Won',
                icon: Trophy,
                accent: 'text-yellow-500',
                ring: 'ring-yellow-500/30',
            }
          : {
                title: 'You Lost',
                icon: Frown,
                accent: 'text-destructive',
                ring: 'ring-destructive/20',
            };

    const Icon = outcome.icon;

    return (
        <Dialog defaultOpen>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader className="items-center text-center gap-3">
                    <div
                        className={cn(
                            'flex h-16 w-16 items-center justify-center rounded-full ring-4',
                            outcome.ring,
                        )}
                    >
                        <Icon className={cn('h-8 w-8', outcome.accent)} />
                    </div>

                    <DialogTitle className="text-2xl">{outcome.title}</DialogTitle>
                    <DialogDescription className="capitalize">By {reason}</DialogDescription>
                </DialogHeader>

                {playerEloDiff !== null && (
                    <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/40 py-3">
                        {playerEloDiff >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <span
                            className={cn(
                                'text-lg font-semibold tabular-nums',
                                playerEloDiff >= 0 ? 'text-emerald-500' : 'text-destructive',
                            )}
                        >
                            {playerEloDiff >= 0 ? '+' : ''}
                            {playerEloDiff}
                        </span>
                        <span className="text-sm text-muted-foreground">rating</span>
                    </div>
                )}

                <DialogFooter className="sm:justify-center grid grid-cols-2">
                    <Button className="cursor-pointer" asChild>
                        <Link href="/">Home</Link>
                    </Button>
                    <Button asChild variant="outline" className="cursor-pointer">
                        <Link href="/multiplayer">New Game</Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
