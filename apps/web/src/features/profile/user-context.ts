import { Session } from '@/lib/auth-client';
import { Narrow, Stats } from '@bchess/shared';
import { createContext } from 'react';

export type UserWithUsername = Narrow<
    Session['user'],
    {
        username: string;
    }
>;

type UserContext = {
    user: UserWithUsername;
    stats: Stats;
    session: Session['session'];
};

export const UserContext = createContext<UserContext | null>(null);
