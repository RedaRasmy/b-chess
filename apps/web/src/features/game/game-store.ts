import { ClockState, GameState, GameStore } from "@/features/game/types"
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

// const DEFAULT_CLOCK: ClockState = {
//     white: 10 * 60 * 1000,
//     black: 10 * 60 * 1000,
//     increment: 0,
//     activeColor: null,
//     lastTickAt: null,
// }

function initGame(): GameState {
    const chess = new Chess()
    return {
        lastAction: null,
        chess: chess,
        fen: chess.fen(),
        mode: "idle",
        status: "matching",
        playerColor: null,
        white: null,
        black: null,
        moveHistory: [],
        selectedSquare: null,
        legalMoves: [],
        result: null,
        endReason: null,
        clock: null,
        viewIndex: null,
        displayFen: chess.fen(),
        whiteEloDiff: null,
        blackEloDiff: null,
        whiteStatus: null,
        blackStatus: null,
    }
}

export const useGameStore = create<GameStore>()(
    persist(
        subscribeWithSelector((set, get) => ({
            ...initGame(),

            undo: () => {
                const { chess, playerColor, mode, status } = get()
                if (!playerColor || mode !== "bot" || status !== "playing")
                    return

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
            rollback: ({
                blackTimeLeft,
                gameStartedAt,
                lastMoveAt,
                whiteTimeLeft,
            }) => {
                const { chess, playerColor, mode, status, clock } = get()
                if (
                    !playerColor ||
                    mode !== "multiplayer" ||
                    status !== "playing"
                )
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
                    clock: {
                        activeColor: chess.turn() === "w" ? "white" : "black",
                        white: whiteTimeLeft,
                        black: blackTimeLeft,
                        lastTickAt: lastMoveAt ?? gameStartedAt,
                        increment: clock?.increment ?? 0,
                    },
                })
            },

            selectSquare: (square) => {
                const { chess, selectedSquare, playerColor, status } = get()

                if (status !== "playing") return

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

                if (playerColor && turn !== playerColor) {
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
                const { chess, clock, playerColor } = get()

                if (!playerColor) return null

                try {
                    const move = chess.move({ from, to, promotion })

                    const isMyMove = move.color === getColor(playerColor)

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

                    let newClock: ClockState | null = updateClock ? null : clock

                    if (clock && updateClock) {
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
                        clock: newClock,
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

            setPlayers: (white, black) => set({ white, black }),
            setPlayerColor: (color) => set({ playerColor: color }),
            setStatus: (status) => set({ status }),
            setMode: (mode) => set({ mode }),

            endGame: ({ result, reason, elo, withSound = true }) => {
                const { clock } = get()

                const lastActionWrapper =
                    reason === "Timeout"
                        ? {
                              lastAction: {
                                  type: "timeout" as const,
                              },
                          }
                        : {}

                set({
                    result,
                    endReason: reason,
                    status: "finished",
                    whiteEloDiff: elo?.whiteEloDiff ?? null,
                    blackEloDiff: elo?.blackEloDiff ?? null,
                    clock: clock
                        ? {
                              ...clock,
                              activeColor: null,
                              lastTickAt: null,
                              ...(reason === "Timeout" && {
                                  [result === "white_won" ? "black" : "white"]:
                                      0,
                              }),
                          }
                        : null,
                    ...lastActionWrapper,
                })

                if (withSound) {
                    playSound("gameEnd")
                }
            },

            startClock: (timeControl) => {
                if (!timeControl) {
                    set({ clock: null })
                    return
                }
                const { increment, initial, lastTickAt } = timeControl
                set({
                    clock: {
                        white: initial,
                        black: initial,
                        increment,
                        activeColor: "white",
                        lastTickAt: lastTickAt ?? Date.now(),
                    },
                })

                playSound("gameStart")
            },

            pauseClock: () => {
                const { clock } = get()
                if (!clock) return
                set({
                    clock: { ...clock, activeColor: null, lastTickAt: null },
                })
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

            syncTimer: ({
                blackTimeLeft,
                gameStartedAt,
                lastMoveAt,
                whiteTimeLeft,
            }) => {
                const { clock } = get()

                if (!clock) return

                set({
                    clock: {
                        activeColor: clock.activeColor,
                        white: whiteTimeLeft,
                        black: blackTimeLeft,
                        lastTickAt: lastMoveAt ?? gameStartedAt,
                        increment: clock.increment,
                    },
                })
            },
            syncGame: (game, playerColor) => {
                get().resetGame()
                get().setMode("multiplayer")
                get().setPlayerColor(playerColor)
                get().setStatus(game.status)

                get().setPlayers(
                    {
                        id: game.whiteId,
                        username: game.white.username,
                        avatar: game.white.image,
                        rating: game.whiteRating,
                    },
                    {
                        id: game.blackId,
                        username: game.black.username,
                        avatar: game.black.image,
                        rating: game.blackRating,
                    },
                )

                game.moves.forEach(({ from, to, promotion }) => {
                    get().makeMove({
                        from,
                        to,
                        promotion,
                        ack: false,
                        withSound: false,
                    })
                })

                const { plus } = parseTimerOption(game.timer)

                set({
                    clock: {
                        activeColor: getColorName(game.currentTurn),
                        white: game.whiteTimeLeft,
                        black: game.blackTimeLeft,
                        lastTickAt: game.lastMoveAt ?? game.gameStartedAt,
                        increment: plus * 1000,
                    },
                    whiteStatus: game.whiteStatus,
                    blackStatus: game.blackStatus,
                })

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
            setPlayerStatus: (color, status) => {
                if (color === "w") {
                    set({
                        whiteStatus: status,
                    })
                } else {
                    set({
                        blackStatus: status,
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
                          moveHistory: state.moveHistory.map((m) => ({
                              from: m.from,
                              to: m.to,
                              promotion: m.promotion,
                          })),
                          playerColor: state.playerColor,
                          clock: state.clock,
                          white: state.white,
                          black: state.black,
                          status: state.status,
                          result: state.result,
                          endReason: state.endReason,
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
