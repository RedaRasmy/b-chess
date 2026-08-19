import { getCapturedPieces } from '@/features/game/utils/get-captured-pieces';
import { Chess } from 'chess.js';
import { test, expect } from 'vitest';

test('Utiltiy: get captured pieces ', () => {
    expect(getCapturedPieces(new Chess())).toStrictEqual({
        white: {},
        black: {},
    });

    const fen = 'rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2';
    expect(getCapturedPieces(new Chess(fen))).toStrictEqual({
        white: { p: 1 },
        black: {},
    });
});
