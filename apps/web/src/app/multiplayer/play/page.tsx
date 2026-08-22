'use client';
import GameBoard from '@/features/game/components/game-board';
import PlayerInfo from '@/features/game/components/player-info';
import { useGameStore } from '@/features/game/game-store';
import DrawRequestDialog from '@/features/multiplayer/components/draw-request-dialog';
import MultiplayerEndDialog from '@/features/multiplayer/components/multiplayer-end-dialog';
import MultiplayerControls from '@/features/multiplayer/components/mutiplayer-controls';
import { useSocket } from '@/features/multiplayer/hooks/use-socket';
import { useSocketListener } from '@/features/multiplayer/hooks/use-socket-listener';
import { getColor } from '@bchess/shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const socket = useSocket();
    const router = useRouter();
    const players = useGameStore((s) => s.players);

    useEffect(() => {
        socket.emit('join_game');
    }, [socket]);

    useEffect(() => {
        const unsubscribe = useGameStore.subscribe(
            (state) => state.lastAction,
            (lastAction) => {
                if (!lastAction) return;

                if (lastAction.type === 'timeout') {
                    socket.emit('timeout');
                }

                if (lastAction.type === 'move') {
                    socket.emit('move', lastAction.move, (res) => {
                        console.log('Move Ack: ', res.status);

                        if (res.status == 'error') {
                            console.warn('error : ', res.error);
                            console.warn('rollback..');

                            useGameStore.getState().rollback(res.timestamps);
                        }
                    });
                }
            },
        );

        return () => unsubscribe();
    }, [socket]);

    useSocketListener('exception', (exception) => {
        if (exception.code === 'GAME_NOT_FOUND') {
            router.replace('/multiplayer');
        }
    });

    const playerColor = players?.playerColor;

    const opponentColor = playerColor === undefined ? null : playerColor === 'white' ? 'b' : 'w';

    const color = playerColor === undefined ? null : getColor(playerColor);

    return (
        <div className="flex flex-wrap w-full h-full gap-3 lg:gap-5 xl:gap-8">
            <MultiplayerEndDialog />
            <DrawRequestDialog />
            <div className="flex-auto flex justify-center items-center">
                <div className="flex flex-col w-full max-w-[75vh] gap-2 px-1">
                    <PlayerInfo color={opponentColor} />
                    <GameBoard />
                    <PlayerInfo color={color} />
                </div>
            </div>
            <MultiplayerControls />
        </div>
    );
}
