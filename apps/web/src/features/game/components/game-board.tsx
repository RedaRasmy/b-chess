import { PromotionDialog } from '@/features/game/components/promotion-dialog';
import { useGameStore } from '@/features/game/game-store';
import { getColor, PromotionPiece } from '@bchess/shared';
import { Square } from 'chess.js';
import { useState } from 'react';
import { Chessboard, SquareHandlerArgs } from 'react-chessboard';

export default function GameBoard() {
    const {
        players,
        displayFen,
        selectSquare,
        selectedSquare,
        legalMoves,
        moveHistory,
        viewIndex,
        makeMove,
        chess,
    } = useGameStore();

    const [isPromotion, setIsPromotion] = useState(false);
    const [promotionMove, setPromtionMove] = useState<null | { from: Square; to: Square }>(null);

    function onPieceDrop(from: Square, to: Square) {
        const isPromotion = chess
            .moves({ square: from, verbose: true })
            .some((m) => m.to === to && m.promotion);

        if (isPromotion) {
            setIsPromotion(true);
            setPromtionMove({
                from,
                to,
            });
            return false;
        }

        selectSquare(from);
        const move = selectSquare(to);
        return !!move;
    }

    const legalMoveStyles = Object.fromEntries(
        legalMoves.map((sq) => [
            sq,
            {
                background:
                    'radial-gradient(circle, color-mix(in oklch, var(--primary) 70%, transparent) 25%, transparent 25%)',
            },
        ]),
    );

    const selectedSquareStyle = selectedSquare
        ? {
              [selectedSquare]: {
                  backgroundColor: 'color-mix(in oklch, var(--primary) 20%, transparent)',
              },
          }
        : {};

    const lastMove = viewIndex !== null ? moveHistory.at(viewIndex) : undefined;

    const lastMoveSquareStyle = {
        boxShadow: 'inset 0 0 0 3px color-mix(in oklch, yellow 40%, transparent)',
    };

    const lastMoveStyle = lastMove
        ? {
              [lastMove.from]: lastMoveSquareStyle,
              [lastMove.to]: lastMoveSquareStyle,
          }
        : {};

    const promotionColor = getColor(players?.playerColor ?? 'w');

    function promote(promotion: PromotionPiece) {
        if (!promotionMove || !isPromotion) {
            throw new Error('promotion move must be defined!');
        }
        const move = makeMove({
            from: promotionMove.from,
            to: promotionMove.to,
            promotion,
        });

        if (move) {
            setIsPromotion(false);
            return;
        }

        throw new Error('Invalid Promotion Move');
    }

    function handleSquareClick({ square }: SquareHandlerArgs) {
        const isPromotion =
            selectedSquare &&
            chess
                .moves({ square: selectedSquare, verbose: true })
                .some((m) => m.to === square && m.promotion);

        if (isPromotion) {
            setIsPromotion(true);
            setPromtionMove({
                from: selectedSquare,
                to: square as Square,
            });
            return;
        }
        selectSquare(square as Square);
    }
    return (
        <>
            <PromotionDialog
                open={isPromotion}
                onOpenChange={setIsPromotion}
                color={promotionColor}
                onSelect={promote}
            />
            <Chessboard
                options={{
                    boardStyle: {
                        borderRadius: 5,
                    },
                    darkSquareStyle: {
                        backgroundColor: 'var(--secondary)',
                    },
                    lightSquareStyle: {
                        backgroundColor: 'oklch(from var(--primary) l c h / 0.5)',
                    },
                    darkSquareNotationStyle: {
                        color: 'var(--primary)',
                    },
                    lightSquareNotationStyle: {
                        color: 'black',
                    },
                    boardOrientation: players?.playerColor ?? 'white',
                    position: displayFen,
                    onSquareClick: handleSquareClick,
                    onPieceDrop: ({ sourceSquare, targetSquare }) =>
                        onPieceDrop(sourceSquare as Square, targetSquare as Square),
                    squareStyles: {
                        ...legalMoveStyles,
                        ...selectedSquareStyle,
                        ...lastMoveStyle,
                    },
                }}
            />
        </>
    );
}
