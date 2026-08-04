import { checkGameEnd, MoveType, PlayerConnectionState } from '@bchess/shared';
import { Chess, Color } from 'chess.js';

export class LiveGame {
    private chess: Chess;
    private whiteStatus: PlayerConnectionState;
    private blackStatus: PlayerConnectionState;

    constructor(moves?: MoveType[]) {
        this.chess = new Chess();

        if (moves) {
            moves.forEach((move) => {
                this.chess.move({
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion,
                });
            });
        }

        this.whiteStatus = {
            status: 'connected',
        };
        this.blackStatus = {
            status: 'connected',
        };
    }

    getWhiteStatus() {
        return this.whiteStatus.status;
    }

    getBlackStatus() {
        return this.blackStatus.status;
    }

    getPlayerStatus(color: Color) {
        if (color === 'w') return this.getWhiteStatus();
        return this.getBlackStatus();
    }

    setWhiteConnected() {
        this.whiteStatus = {
            status: 'connected',
        };
    }

    setBlackConnected() {
        this.blackStatus = {
            status: 'connected',
        };
    }

    setWhiteDisconnected() {
        this.whiteStatus.status = 'disconnected';
        this.whiteStatus.disconnectedAt = Date.now();
    }

    setBlackDisconnected() {
        this.blackStatus.status = 'disconnected';
        this.blackStatus.disconnectedAt = Date.now();
    }

    setPlayerConnected(color: Color) {
        if (color === 'w') {
            this.setWhiteConnected();
        } else {
            this.setBlackConnected();
        }
    }

    setPlayerDisconnected(color: Color) {
        if (color === 'w') {
            this.setWhiteDisconnected();
        } else {
            this.setBlackDisconnected();
        }
    }

    move(move: MoveType) {
        const turn = this.chess.turn();

        if (turn === 'w') {
            this.setWhiteConnected();
        } else {
            this.setBlackConnected();
        }

        const moveResult = this.chess.move(move);
        const end = checkGameEnd(this.chess);

        return {
            move: moveResult,
            end,
        };
    }

    getMovesPlayed() {
        return this.chess.history().length;
    }

    getHistory() {
        return this.chess.history();
    }
}
