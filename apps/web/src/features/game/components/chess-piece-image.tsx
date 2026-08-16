import { cn } from '@/lib/utils';
import { Piece } from 'chess.js';
import Image from 'next/image';

export default function ChessPieceImage({
    piece,
    className,
    size,
}: {
    piece: Piece;
    className?: string;
    size?: number;
}) {
    const { color, type } = piece;

    return (
        <Image
            data-testid={`${color}${type}`}
            alt={type}
            width={size}
            height={size}
            fill={!size}
            sizes="(max-width:50px)"
            draggable={false}
            src={`/images/chess-pieces/${color}${type}.png`}
            className={cn(`select-none`, className)}
        />
    );
}
