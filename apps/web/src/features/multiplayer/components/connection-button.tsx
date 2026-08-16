'use client';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/features/multiplayer/hooks/use-socket';
import { useEffect, useState } from 'react';

/**
 * For testing and debugging purposes
 */
export default function ConnectionButton() {
    const socket = useSocket();
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        setConnected(socket.connected);

        function handleConnect() {
            setConnected(true);
        }
        function handleDisconnect() {
            setConnected(false);
        }

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, [socket]);

    function handleToggle() {
        if (socket.connected) {
            socket.disconnect();
        } else {
            socket.connect();
        }
    }

    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <Button onClick={handleToggle} variant={connected ? 'destructive' : 'default'}>
            {connected ? 'Disconnect' : 'Connect'}
        </Button>
    );
}
