import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { validateRatingRange } from '@bchess/shared';
import { TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export type Range = [number, number];

export default function RatingRange({
    range,
    onRangeChange,
    disabled = false,
    className,
}: {
    range: Range;
    onRangeChange: (range: Range) => void;
    disabled?: boolean;
    className?: string;
}) {
    const [localRange, setLocalRange] = useState<Range>(range);

    useEffect(() => {
        setLocalRange(range);
    }, [range]);

    return (
        <div className={cn('my-5 w-full space-y-5 lg:space-y-6', className)}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Button
                        size={'sm'}
                        onClick={() => onRangeChange([-100, 100])}
                        className="cursor-pointer"
                        variant={'outline'}
                        disabled={disabled}
                    >
                        default
                    </Button>
                    <Button
                        size={'icon-sm'}
                        onClick={() => onRangeChange([-400, 400])}
                        className="cursor-pointer"
                        disabled={disabled}
                    >
                        <Zap />
                    </Button>
                    <Button
                        size={'icon-sm'}
                        onClick={() => onRangeChange([200, 400])}
                        className="cursor-pointer"
                        disabled={disabled}
                    >
                        <TrendingUp />
                    </Button>
                </div>
                <span className="text-sm text-muted-foreground">{localRange.join(', ')}</span>
            </div>
            <Slider
                disabled={disabled}
                value={localRange}
                max={400}
                min={-400}
                step={50}
                className="w-full"
                onValueChange={([x, y]) => {
                    if (x === undefined || y === undefined) return;
                    setLocalRange([x, y]);
                }}
                onValueCommit={([x, y]) => {
                    if (x === undefined || y === undefined) return;

                    if (validateRatingRange(x, y)) {
                        onRangeChange([x, y]);
                    } else {
                        setLocalRange(range);
                    }
                }}
            />
        </div>
    );
}
