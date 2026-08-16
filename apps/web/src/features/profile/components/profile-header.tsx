import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { Handshake, Swords, Trophy } from 'lucide-react';
import { Stats } from '@bchess/shared';
import { cn } from '@/lib/utils';
import PlayerAvatar from '@/features/profile/components/player-avatar';

const statConfig = {
    wins: {
        label: 'Wins',
        icon: Trophy,
        text: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10',
    },
    draws: {
        label: 'Draws',
        icon: Handshake,
        text: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-500/10',
    },
    losses: {
        label: 'Losses',
        icon: Swords,
        text: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-500/10',
    },
} as const;

type Props = {
    username: string;
    avatar: string | null | undefined;
    stats: Stats;
};

export default function ProfileHeader({ username, avatar, stats }: Props) {
    const { wins, losses, draws, rating } = stats;

    const totalGames = wins + losses + draws;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    return (
        <Card className="w-full space-y-5 px-6 py-5 lg:w-xl xl:w-2xl">
            <CardHeader className="px-0">
                <div className="flex items-center justify-between gap-5">
                    <div className="flex items-center gap-3">
                        <PlayerAvatar username={username} avatar={avatar} />
                        <div className="flex flex-col">
                            <h1 className="text-xl font-semibold leading-tight">{username}</h1>
                            <span className="text-xs text-muted-foreground">
                                {totalGames} game{totalGames === 1 ? '' : 's'} played
                            </span>
                        </div>
                    </div>
                    <LogoutButton size="sm" />
                </div>
            </CardHeader>

            <CardContent className="space-y-5 px-0">
                {/* rating */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Rating</span>
                        <span className="text-3xl font-bold tabular-nums leading-tight">
                            {rating}
                        </span>
                    </div>
                </div>

                {/* win / draw / loss grid */}
                <div className="grid grid-cols-3 divide-x rounded-lg border">
                    {(['wins', 'draws', 'losses'] as const).map((key) => {
                        const config = statConfig[key];
                        const Icon = config.icon;
                        return (
                            <div key={key} className="flex flex-col items-center gap-1.5 py-3">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full',
                                        config.iconBg,
                                    )}
                                >
                                    <Icon className={cn('h-4 w-4', config.text)} />
                                </div>
                                <span className="text-lg font-semibold tabular-nums leading-none">
                                    {stats[key]}
                                </span>
                                <p className="text-xs text-muted-foreground">{config.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* win rate bar */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">Win rate</span>
                        <span className="font-semibold tabular-nums">{winRate}%</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{
                                width: `${totalGames > 0 ? (wins / totalGames) * 100 : 0}%`,
                            }}
                        />
                        <div
                            className="h-full bg-amber-500 transition-all"
                            style={{
                                width: `${totalGames > 0 ? (draws / totalGames) * 100 : 0}%`,
                            }}
                        />
                        <div
                            className="h-full bg-rose-500 transition-all"
                            style={{
                                width: `${totalGames > 0 ? (losses / totalGames) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
