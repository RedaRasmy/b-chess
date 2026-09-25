import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

export default function LastUsedBadge({
    className,
    variant = 'outline',
}: {
    className?: string;
    variant?: BadgeVariant;
}) {
    return (
        <Badge
            className={cn(
                className,
                'absolute top-0 right-0 -translate-y-1/2 translate-x-1/5',
                className,
            )}
            variant={variant}
        >
            Last used
        </Badge>
    );
}
