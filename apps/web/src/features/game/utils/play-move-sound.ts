import { playSound } from '@/lib/sounds';
import { Chess, Move } from 'chess.js';

export function playMoveSound(chess: Chess, move: Move) {
    if (chess.isCheck()) {
        playSound('check');
    } else if (move.captured) {
        playSound('capture');
    } else if (move.isKingsideCastle() || move.isQueensideCastle()) {
        playSound('castle');
    } else if (move.isPromotion()) {
        playSound('promote');
    } else {
        playSound('move');
    }
}
