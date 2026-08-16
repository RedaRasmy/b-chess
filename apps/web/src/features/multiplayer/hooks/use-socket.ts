import { SocketContext } from '@/features/multiplayer/socket-context';
import { useContext } from 'react';

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used inside SocketProvider');

    return context.socket;
}
