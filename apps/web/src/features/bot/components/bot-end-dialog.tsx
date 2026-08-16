import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useBotStore } from '@/features/bot/store';
import { useGameStore } from '@/features/game/game-store';
import Link from 'next/link';

export default function BotEndDialog() {
    const results = useGameStore((s) => s.results);
    const playerColor = useGameStore((s) => s.players?.playerColor);
    const replay = useBotStore((s) => s.replayBotGame);

    if (!results || !playerColor) return null;

    const { result, reason } = results;

    const isDraw = result === 'draw';
    const isWhite = playerColor === 'white';
    const isWin = isWhite && result === 'white_won';

    return (
        <Dialog defaultOpen>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isDraw ? 'You Draw' : isWin ? 'You Won' : 'You Lost'}
                    </DialogTitle>
                    <DialogDescription>By {reason}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button asChild variant="outline">
                        <Link href={'/'}>Home</Link>
                    </Button>
                    <Button className="cursor-pointer" onClick={replay}>
                        Replay
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
