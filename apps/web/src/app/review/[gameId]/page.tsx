'use client';
import GameBoard from '@/features/game/components/game-board';
import PlayerInfo from '@/features/game/components/player-info';
import { useGameStore } from '@/features/game/game-store';
import ReviewControls from '@/features/reviews/components/review-controls';
import { useGame } from '@/features/reviews/hooks/use-game';
import { authClient } from '@/lib/auth-client';
import { getOppositeColor } from '@bchess/shared';
import { Color } from 'chess.js';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
    const params = useParams();

    const gameId = params.gameId as string;

    const { data: game, isPending } = useGame(gameId);
    const { data: session, isPending: isSessionPending } = authClient.useSession();

    const [playerColor, setPlayerColor] = useState<Color>('w');

    const setGame = useGameStore((s) => s.setGame);

    useEffect(() => {
        if (!isPending && game && !isSessionPending) {
            const userId = session?.user.id;
            const playerColor = userId ? (game.whiteId === userId ? 'white' : 'black') : 'white';

            if (playerColor === 'black') {
                setPlayerColor('b');
            }

            setGame(
                'review',
                {
                    ...game,
                    whiteStatus: null,
                    blackStatus: null,
                },
                playerColor,
            );
        }
    }, [game, isPending, isSessionPending, session, setGame]);

    const opponentColor = getOppositeColor(playerColor);

    return (
        <div className="flex flex-wrap w-full h-full gap-3 lg:gap-5 xl:gap-8">
            <div className="flex-auto flex justify-center items-center">
                <div className="flex flex-col w-full max-w-[75vh] gap-2 px-1">
                    <PlayerInfo color={opponentColor} />
                    <GameBoard />
                    <PlayerInfo color={playerColor} />
                </div>
            </div>
            <ReviewControls />
        </div>
    );
}
