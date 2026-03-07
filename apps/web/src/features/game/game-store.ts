import {
    ClockState,
    GameEndReason,
    GameResult,
    GameState,
    PromotionPiece,
} from "@/features/game/types"
import { Chess, Move, Square } from "chess.js"
import { create } from "zustand"

const DEFAULT_CLOCK: ClockState = {
    white: 10 * 60 * 1000,
    black: 10 * 60 * 1000,
    increment: 0,
    activeColor: null,
    lastTickAt: null,
}

export const useGameStore = create<GameState>((set, get) => ({
    chess: new Chess(),
    fen: new Chess().fen(),
    mode: "idle",
    status: "waiting",
    playerColor: null,
    white: null,
    black: null,
    moveHistory: [],
    lastMove: null,
    selectedSquare: null,
    legalMoves: [],
    result: null,
    endReason: null,
    clock: DEFAULT_CLOCK,

    

    selectSquare: (square) => {
        const { chess, selectedSquare, playerColor, status } = get()

        if (status !== "playing") return

        if (selectedSquare === square) {
            return set({ selectedSquare: null, legalMoves: [] })
        }

        if (selectedSquare) {
            const move = get().makeMove(selectedSquare, square)
            if (move) return // move was made, deselection handled inside makeMove
        }

        const piece = chess.get(square)
        const turn = chess.turn() === "w" ? "white" : "black"

        if (!piece || piece.color !== (turn === "white" ? "w" : "b")) {
            return set({ selectedSquare: null, legalMoves: [] })
        }

        // only allow selecting your own pieces
        if (playerColor && turn !== playerColor) {
            return set({ selectedSquare: null, legalMoves: [] })
        }

        const moves = chess
            .moves({ square, verbose: true })
            .map((m) => m.to as Square)

        set({ selectedSquare: square, legalMoves: moves })
    },

    makeMove: (from, to, promotion = "q") => {
        const { chess, clock } = get()

        try {
            const move = chess.move({ from, to, promotion })

            let newClock: ClockState | null = null

            if (clock) {
                const color = move.color === "w" ? "white" : "black"
                const elapsed = clock.lastTickAt
                    ? Date.now() - clock.lastTickAt
                    : 0
                newClock = {
                    ...clock,
                    [color]: clock[color] - elapsed + clock.increment,
                    activeColor: color === "white" ? "black" : "white",
                    lastTickAt: Date.now(),
                }
            }

            set({
                fen: chess.fen(),
                moveHistory: chess.history({ verbose: true }) as Move[],
                lastMove: {
                    from,
                    to,
                    promotion: move.promotion as PromotionPiece | undefined,
                },
                selectedSquare: null,
                legalMoves: [],
                clock: newClock,
            })

            if (chess.isGameOver()) {
                let result: GameResult = null
                let reason: GameEndReason = null

                if (chess.isCheckmate()) {
                    result = chess.turn() === "w" ? "black" : "white"
                    reason = "checkmate"
                } else if (chess.isStalemate()) {
                    result = "draw"
                    reason = "stalemate"
                } else if (chess.isInsufficientMaterial()) {
                    result = "draw"
                    reason = "insufficient_material"
                } else if (chess.isThreefoldRepetition()) {
                    result = "draw"
                    reason = "threefold_repetition"
                } else if (chess.isDraw()) {
                    result = "draw"
                    reason = "draw_agreement"
                }

                get().endGame(result, reason)
            }

            return move
        } catch {
            return null
        }
    },

    setPosition: (fen) => {
        const chess = new Chess(fen)
        set({
            chess,
            fen,
            moveHistory: [],
            lastMove: null,
            selectedSquare: null,
            legalMoves: [],
        })
    },

    resetGame: () => {
        const chess = new Chess()
        set({
            chess,
            fen: chess.fen(),
            mode: "idle",
            status: "waiting",
            playerColor: null,
            white: null,
            black: null,
            moveHistory: [],
            lastMove: null,
            selectedSquare: null,
            legalMoves: [],
            result: null,
            endReason: null,
            clock: DEFAULT_CLOCK,
        })
    },

    setPlayers: (white, black) => set({ white, black }),
    setPlayerColor: (color) => set({ playerColor: color }),
    setStatus: (status) => set({ status }),
    setMode: (mode) => set({ mode }),

    endGame: (result, reason) => {
        const { clock } = get()

        set({
            result,
            endReason: reason,
            status: "finished",
            clock: clock ? { ...clock, activeColor: null } : null,
        })
    },

    startClock: (timeControl) => {
        if (!timeControl) {
            set({ clock: null })
            return
        }
        const { increment, initial } = timeControl
        set({
            clock: {
                white: initial,
                black: initial,
                increment,
                activeColor: "white",
                lastTickAt: Date.now(),
            },
        })
    },

    pauseClock: () => {
        const { clock } = get()
        if (!clock) return
        set({ clock: { ...clock, activeColor: null, lastTickAt: null } })
    },

}))
