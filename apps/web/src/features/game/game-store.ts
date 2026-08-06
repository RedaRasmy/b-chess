import { clockSlice } from "@/features/game/slices/clock.slice"
import { displaySlice } from "@/features/game/slices/display.slice"
import { playersSlice } from "@/features/game/slices/players.slice"
import { resultsSlice } from "@/features/game/slices/results.slice"
import { GameStore, OldState } from "@/features/game/types"
import { playSound } from "@/lib/sounds"
import {
    checkGameEnd,
    getColor,
    getColorName,
    parseTimerOption,
} from "@bchess/shared"
import { Chess, Square } from "chess.js"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { persist, createJSONStorage } from "zustand/middleware"

function initGame(): OldState {
    const chess = new Chess()
    return {
        //
        lastAction: null,
        mode: "idle",
        status: "matching",
        //
        chess: chess,
        fen: chess.fen(),
        selectedSquare: null,
        legalMoves: [],
    }
}

export const useGameStore = create<GameStore>()(
    persist(
        subscribeWithSelector((set, get, write) => ({
            ...playersSlice(set, get, write),
            ...clockSlice(set, get, write),
            ...resultsSlice(set, get, write),
            ...displaySlice(set, get, write),
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
                    fen: chess.fen(),
                    displayFen: chess.fen(),
                    selectedSquare: null,
                    legalMoves: [],
                })

                get().rollbackDisplay()
            },
            rollback: (timestamps) => {
                const { chess, mode, status, players } = get()
                if (!players || mode !== "multiplayer" || status !== "playing")
                    return

                chess.undo() // remove (fen)

                set({
                    fen: chess.fen(), // remove
                    selectedSquare: null,
                    legalMoves: [],
                })

                get().rollbackDisplay()
                get().rollbackClock(timestamps)
            },

            selectSquare: (square) => {
                const { chess, selectedSquare, players, status } = get()

                if (status !== "playing" || !players) return

                if (selectedSquare === square) {
                    return set({ selectedSquare: null, legalMoves: [] })
                }

                if (selectedSquare) {
                    const move = get().makeMove({
                        from: selectedSquare,
                        to: square,
                    })
                    if (move) return
                }

                const piece = chess.get(square)
                const turn = chess.turn() === "w" ? "white" : "black"

                if (!piece || piece.color !== (turn === "white" ? "w" : "b")) {
                    return set({ selectedSquare: null, legalMoves: [] })
                }

                if (turn !== players.playerColor) {
                    return set({ selectedSquare: null, legalMoves: [] })
                }

                const moves = chess
                    .moves({ square, verbose: true })
                    .map((m) => m.to as Square)

                set({ selectedSquare: square, legalMoves: moves })
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

                    const isMyMove =
                        move.color === getColor(players.playerColor)

                    if (withSound) {
                        if (chess.isCheck()) {
                            playSound("check")
                        } else if (move.captured) {
                            playSound("capture")
                        } else if (
                            move.isKingsideCastle() ||
                            move.isQueensideCastle()
                        ) {
                            playSound("castle")
                        } else if (move.isPromotion()) {
                            playSound("promote")
                        } else {
                            playSound("move")
                        }
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
                        fen: chess.fen(),
                        selectedSquare: null,
                        legalMoves: [], // TODO: null would be better ?? or set directly the new legal moves ?
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

            resetGame: () => {
                set(initGame())

                get().resetPlayers()
                get().resetClock()
                get().resetResults()
                get().resetDisplay()
            },

            setStatus: (status) => set({ status }),
            setMode: (mode) => set({ mode }),

            syncGame: (game, playerColor) => {
                get().resetGame()
                get().setMode("multiplayer")

                get().setPlayers({
                    white: {
                        id: game.whiteId,
                        username: game.white.username,
                        avatar: game.white.image,
                        rating: game.whiteRating,
                        status: game.whiteStatus,
                    },
                    black: {
                        id: game.blackId,
                        username: game.black.username,
                        avatar: game.black.image,
                        rating: game.blackRating,
                        status: game.blackStatus,
                    },
                    playerColor,
                })

                const { plus } = parseTimerOption(game.timer)

                get().setClock({
                    activeColor: getColorName(game.currentTurn),
                    white: game.whiteTimeLeft,
                    black: game.blackTimeLeft,
                    lastTickAt: game.lastMoveAt ?? game.gameStartedAt,
                    increment: plus * 1000,
                })

                game.moves.forEach(({ from, to, promotion }) => {
                    get().makeMove({
                        from,
                        to,
                        promotion,
                        ack: false,
                        withSound: false,
                    })
                })

                get().setStatus(game.status)

                if (game.result) {
                    get().endGame({
                        result: game.result,
                        reason: game.reason!,
                        elo: {
                            whiteEloDiff: game.whiteEloDiff!,
                            blackEloDiff: game.blackEloDiff!,
                        },
                        withSound: false,
                    })
                }
            },
        })),
        {
            name: "game-state",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) =>
                state.mode === "bot"
                    ? {
                          mode: state.mode,
                          players: state.players,
                          clock: state.clock,
                          moveHistory: state.moveHistory.map((m) => ({
                              from: m.from,
                              to: m.to,
                              promotion: m.promotion,
                          })),
                          results: state.results,
                      }
                    : {},

            onRehydrateStorage: () => (state) => {
                if (state && state.mode === "bot") {
                    const chess = new Chess()

                    const moves = [...state.moveHistory]
                    state.moveHistory = []
                    moves.forEach((move) => {
                        state.makeMove({
                            ...move,
                            ack: false,
                            withSound: false,
                            updateClock: false,
                        })
                    })

                    state.chess = chess
                }
            },
        },
    ),
)
