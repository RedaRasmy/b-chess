'use client';

import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { PromotionPiece } from '@bchess/shared';
import { Color } from 'chess.js';

const PIECES: { type: PromotionPiece; label: string }[] = [
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
];

export interface PromotionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    color: Color;
    onSelect: (piece: PromotionPiece) => void;
}

export function PromotionDialog({ open, onOpenChange, color, onSelect }: PromotionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Promote pawn</DialogTitle>
                    <DialogDescription>Choose a piece to promote to.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-4 gap-2">
                    {PIECES.map(({ type, label }) => (
                        <button
                            key={type}
                            type="button"
                            aria-label={label}
                            onClick={() => {
                                onSelect(type);
                                onOpenChange(false);
                            }}
                            className="group flex flex-col items-center gap-1 rounded-md border bg-card p-2 text-card-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <Image
                                src={`/images/chess-pieces/${color}${type}.png`}
                                alt=""
                                width={64}
                                height={64}
                                className="h-14 w-14 select-none object-contain sm:h-16 sm:w-16"
                                draggable={false}
                            />
                            <span className="text-xs text-muted-foreground group-hover:text-accent-foreground">
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
