import { Skeleton } from '@/components/ui/skeleton';

function GameHistoryItemSkeleton() {
    return (
        <div className="relative flex items-center gap-4 overflow-hidden rounded-lg border bg-card py-3 pl-4 pr-4">
            {/* result accent bar */}
            <span className="absolute left-0 top-0 h-full w-1 bg-muted" aria-hidden="true" />

            {/* avatar */}
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

            {/* main content */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
            </div>

            {/* duration */}
            <Skeleton className="hidden h-3 w-10 shrink-0 sm:block" />

            {/* result pill */}
            <Skeleton className="h-6 w-6 shrink-0 rounded-full sm:h-6 sm:w-16" />
        </div>
    );
}

export function GameHistorySkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="flex w-full lg:w-xl xl:w-2xl flex-col gap-2 p-4 ">
            <Skeleton className="mb-1 h-3.5 w-24" />
            {Array.from({ length: count }).map((_, i) => (
                <GameHistoryItemSkeleton key={i} />
            ))}
        </div>
    );
}
