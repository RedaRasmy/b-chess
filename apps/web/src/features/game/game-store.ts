import { clockSlice } from "@/features/game/slices/clock.slice"
import { playersSlice } from "@/features/game/slices/players.slice"
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
        moveHistory: [],
        selectedSquare: null,
        legalMoves: [],
        viewIndex: null,
        displayFen: chess.fen(),
        //
        results: null,
    }
}

export const useGameStore = create<GameStore>()(
    persist(
        subscribeWithSelector((set, get, write) => ({
            ...playersSlice(set, get, write),
            ...clockSlice(set, get, write),
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

                const newHistory = chess.history({ verbose: true })

                set({
                    fen: chess.fen(),
                    displayFen: chess.fen(),
                    moveHistory: newHistory,
                    viewIndex: null,
                    selectedSquare: null,
                    legalMoves: [],
                })
            },
            rollback: (timestamps) => {
                const { chess, mode, status, players } = get()
                if (!players || mode !== "multiplayer" || status !== "playing")
                    return

                chess.undo()

                const newHistory = chess.history({ verbose: true })

                set({
                    fen: chess.fen(),
                    displayFen: chess.fen(),
                    moveHistory: newHistory,
                    viewIndex: null,
                    selectedSquare: null,
                    legalMoves: [],
                })

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
                const { chess, clock, players } = get()

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
                        displayFen: chess.fen(),
                        viewIndex: null,
                        moveHistory: chess.history({ verbose: true }),
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

            setPosition: (fen) => {
                const chess = new Chess(fen)
                set({
                    chess,
                    fen,
                    moveHistory: [],
                    selectedSquare: null,
                    legalMoves: [],
                })
            },

            resetGame: () => {
                set(initGame())
            },

            setStatus: (status) => set({ status }),
            setMode: (mode) => set({ mode }),

            endGame: ({ result, reason, elo, withSound = true }) => {
                const lastActionWrapper =
                    reason === "Timeout"
                        ? {
                              lastAction: {
                                  type: "timeout" as const,
                              },
                          }
                        : {}

                get().stopClock({ reason, result })

                set({
                    status: "finished",
                    results: {
                        result,
                        reason,
                        whiteEloDiff: elo?.whiteEloDiff ?? null,
                        blackEloDiff: elo?.blackEloDiff ?? null,
                    },
                    ...lastActionWrapper,
                })

                if (withSound) {
                    playSound("gameEnd")
                }
            },

            goToMove: (index) => {
                const { moveHistory } = get()
                if (index < 0 || index >= moveHistory.length) return

                const chess = new Chess()
                for (let i = 0; i <= index; i++) {
                    chess.move(moveHistory[i]!)
                }
                set({ viewIndex: index, displayFen: chess.fen() })
            },

            goToStart: () => {
                set({ viewIndex: -1, displayFen: new Chess().fen() })
            },

            goToEnd: () => {
                const { fen } = get()
                set({ viewIndex: null, displayFen: fen })
            },

            stepBack: () => {
                const { viewIndex, moveHistory } = get()
                const current = viewIndex ?? moveHistory.length - 1
                if (current <= 0) {
                    get().goToStart()
                } else {
                    get().goToMove(current - 1)
                }
            },

            stepForward: () => {
                const { viewIndex, moveHistory } = get()
                if (viewIndex === null) return
                const next = viewIndex + 1
                if (next >= moveHistory.length) {
                    get().goToEnd()
                } else {
                    get().goToMove(next)
                }
            },

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
