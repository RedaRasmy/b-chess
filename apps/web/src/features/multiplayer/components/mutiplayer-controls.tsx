import { ActionButton } from '@/components/ui/action-button';
import HistoryController from '@/features/game/components/history-controller';
import { useSocket } from '@/features/multiplayer/hooks/use-socket';
import { Flag, Handshake } from 'lucide-react';

export default function MultiplayerControls() {
    const socket = useSocket();

    async function handleResign() {
        socket.emit('resign');

        return {
            error: false,
        };
    }

    async function handleDraw() {
        socket.emit('request_draw');

        return {
            error: false,
        };
    }

    return (
        <div className="bg-secondary flex-1 w-full landscape:min-w-80 py-5 flex flex-col gap-5 lg:gap-8 justify-center items-center border-l border-black/30 ">
            <div className="flex flex-col w-full items-center px-2 lg:px-4 gap-1">
                {/* <Button
                    className="cursor-pointer font-semibold max-w-70 w-full"
                    onClick={}
                    variant={"outline"}
                >
                    <RotateCcw />
                    Rematch
                </Button> */}
                <ActionButton
                    className="cursor-pointer font-semibold max-w-70 w-full"
                    action={handleResign}
                    requireAreYouSure
                    areYouSureTitle="Resignation"
                    areYouSureDescription="Are you sure you want to resign?"
                    variant={'outline'}
                >
                    <Flag />
                    Resign
                </ActionButton>
                <ActionButton
                    className="cursor-pointer font-semibold max-w-70 w-full"
                    action={handleDraw}
                    requireAreYouSure
                    areYouSureTitle="Request A Draw"
                    areYouSureDescription="Are you sure?"
                    variant={'outline'}
                >
                    <Handshake />
                    Draw
                </ActionButton>
            </div>
            <HistoryController />
        </div>
    );
}
