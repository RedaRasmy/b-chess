import { clockSlice } from "@/features/game/slices/clock.slice"
import { displaySlice } from "@/features/game/slices/display.slice"
import { playersSlice } from "@/features/game/slices/players.slice"
import { resultsSlice } from "@/features/game/slices/results.slice"
import { validationSlice } from "@/features/game/slices/validation.slice"
import { GameStore, CoreState } from "@/features/game/types"
import { getColorName, parseTimerOption } from "@bchess/shared"
import { Chess } from "chess.js"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { persist, createJSONStorage } from "zustand/middleware"

const init: CoreState = {
    mode: "idle",
    status: "matching",
    lastAction: null,
}

export const useGameStore = create<GameStore>()(
    persist(
        subscribeWithSelector((set, get, write) => ({
            ...playersSlice(set, get, write),
            ...clockSlice(set, get, write),
            ...resultsSlice(set, get, write),
            ...displaySlice(set, get, write),
            ...validationSlice(set, get, write),

            ...init,

            resetGame: () => {
                set(init)

                get().resetPlayers()
                get().resetClock()
                get().resetResults()
                get().resetDisplay()
                get().resetValidation()
            },

            setStatus: (status) => set({ status }),
            setMode: (mode) => set({ mode }),

            setGame: (mode,game, playerColor) => {
                get().resetGame()
                get().setMode(mode)

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

                get().setValidation(game.moves)

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
                          status: state.status,
                      }
                    : {},

            onRehydrateStorage: () => (state) => {
                if (state && state.mode === "bot") {
                    // Note: we must restore the history also not just chess instance
                    // the persisted history is simplified ( MoveType vs Move )

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
