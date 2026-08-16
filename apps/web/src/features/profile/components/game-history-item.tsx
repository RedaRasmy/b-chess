import PlayerAvatar from '@/features/profile/components/player-avatar';
import { cn } from '@/lib/utils';
import { formatMs, GameSummary } from '@bchess/shared';
import { Clock, Crown, Equal, Swords, X } from 'lucide-react';
import Link from 'next/link';

const resultConfig = {
    win: {
        label: 'Win',
        icon: Crown,
        accent: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10',
    },
    loss: {
        label: 'Loss',
        icon: X,
        accent: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-500/10',
    },
    draw: {
        label: 'Draw',
        icon: Equal,
        accent: 'bg-muted-foreground/40',
        text: 'text-muted-foreground',
        iconBg: 'bg-muted',
    },
} as const;

function formatRatingDiff(diff: number) {
    if (diff === 0) return '0';
    return diff > 0 ? `+${diff}` : `${diff}`;
}

export function GameHistoryItem({ game }: { game: GameSummary }) {
    const config = resultConfig[game.result];
    const Icon = config.icon;

    const diffColor =
        game.ratingDiff > 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : game.ratingDiff < 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-muted-foreground';

    return (
        <Link href={`review/${game.id}`}>
            <div className="group relative flex items-center gap-4 overflow-hidden rounded-lg border bg-card py-3 pl-4 pr-4 transition-colors hover:bg-accent/50">
                {/* result accent bar */}
                <span
                    className={cn('absolute left-0 top-0 h-full w-1', config.accent)}
                    aria-hidden="true"
                />

                {/* avatar */}
                <PlayerAvatar username={game.opponent.username} avatar={game.opponent.avatar} />

                {/* main content */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium leading-none">
                            {game.opponent.username}
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Swords className="h-3 w-3" />
                            {game.timer}
                        </span>

                        <div className="hidden xs:flex">
                            <span className="text-muted-foreground/40">·</span>
                            <span className="truncate">{game.reason}</span>
                        </div>
                    </div>
                </div>

                {/* duration */}
                <div className="shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground flex">
                    <Clock className="h-3 w-3" />
                    {formatMs(game.duration)}
                </div>

                {/* rating diff */}
                <span className={cn('shrink-0 text-xs font-semibold tabular-nums', diffColor)}>
                    {formatRatingDiff(game.ratingDiff)}
                </span>

                {/* result */}
                <div
                    className={cn(
                        'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                        config.iconBg,
                        config.text,
                    )}
                >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden xxs:inline">{config.label}</span>
                </div>
            </div>
        </Link>
    );
}
