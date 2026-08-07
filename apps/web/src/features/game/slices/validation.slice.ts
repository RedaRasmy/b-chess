import {
    GameSlice,
    ValidationSlice,
    ValidationState,
} from "@/features/game/types"
import { playMoveSound } from "@/features/game/utils/play-move-sound"
import { checkGameEnd, getColor } from "@bchess/shared"
import { Chess, Square } from "chess.js"

function initGame(): ValidationState {
    const chess = new Chess()
    return {
        chess: chess,
        selectedSquare: null,
    }
}

export const validationSlice: GameSlice<ValidationSlice> = (set, get) => ({
    ...initGame(),

    undo: () => {
        const { chess, mode, status, players } = get()
        if (!players || mode !== "bot" || status !== "playing") return // TODO: allow undo if game has finished ?

        const playerColor = players.playerColor

        const turn = chess.turn()
        if (getColor(playerColor) === turn) {
            chess.undo() // bot's move
            chess.undo()
        } else {
            chess.undo()
        }

        set({
            displayFen: chess.fen(),
            selectedSquare: null,
        })

        get().rollbackDisplay()
    },
    rollback: (timestamps) => {
        const { chess, mode, status, players } = get()
        if (!players || mode !== "multiplayer" || status !== "playing") return // TODO!: rollback iven if the game has finished

        chess.undo()

        set({
            selectedSquare: null,
        })

        get().rollbackDisplay()
        get().rollbackClock(timestamps)
    },

    selectSquare: (square) => {
        // TODO: refactor this shit to be intuitive
        const { chess, selectedSquare, players, status } = get()

        if (status !== "playing" || !players) return

        if (selectedSquare === square) {
            get().maskLegalMoves()
            return set({ selectedSquare: null })
        }

        if (selectedSquare) {
            const move = get().makeMove({
                from: selectedSquare,
                to: square,
            })
            if (move) return move
        }

        const piece = chess.get(square)

        const playerColor = getColor(players.playerColor)
        const isPlayerTurn = chess.turn() === playerColor

        if (!piece || piece.color !== playerColor || !isPlayerTurn) {
            get().maskLegalMoves()
            set({
                selectedSquare: null,
            })
            return
        }

        const moves = chess
            .moves({ square, verbose: true })
            .map((m) => m.to as Square)

        get().showLegalMoves(moves)

        set({ selectedSquare: square })
    },

    makeMove: ({
        from,
        to,
        promotion,
        ack = true,
        withSound = true,
        updateClock = true,
    }) => {
        const { chess, players } = get()

        if (!players) return null

        try {
            const move = chess.move({ from, to, promotion })

            const isMyMove = move.color === getColor(players.playerColor)

            if (withSound) {
                playMoveSound(chess, move)
            }

            if (updateClock) {
                get().switchClock()
            }

            const theMove = {
                from,
                to,
                promotion: move.promotion,
            }

            set({
                selectedSquare: null,
                lastAction:
                    isMyMove && ack
                        ? {
                              type: "move",
                              move: theMove,
                          }
                        : null,
            })

            get().setDisplay(chess.history({ verbose: true }))

            const end = checkGameEnd(chess)

            if (end) {
                get().endGame({
                    reason: end.reason,
                    result: end.result,
                })
            }

            return move
        } catch {
            return null
        }
    },

    resetValidation() {
        set(initGame())
    },

    setValidation(moves) {
        get().resetValidation()

        const { chess, moveHistory } = get()

        try {
            moves.forEach((move) => {
                const fullMove = chess.move(move)
                moveHistory.push(fullMove)
            })
        } catch (error) {
            console.error("Validation Slice/ setValidation: ", error)
        }
    },
})
