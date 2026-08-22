import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { ThrottlerException } from '@nestjs/throttler';
import { Socket } from 'socket.io';

@Catch(ThrottlerException)
export class ThrottlerWsExceptionFilter extends BaseWsExceptionFilter {
    catch(_exception: ThrottlerException, host: ArgumentsHost) {
        const client: Socket = host.switchToWs().getClient();
        const pattern = host.switchToWs().getPattern();

        client.emit('exception', {
            code: 'TOO_MANY_REQUESTS',
            status: 'error',
            message: 'Too many requests',
            pattern,
        });
    }
}
