import { Clock, ClockSlice, GameSlice } from "@/features/game/types"
import { playSound } from "@/lib/sounds"

export const clockSlice: GameSlice<ClockSlice> = (set, get) => ({
    clock: null,

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

    setClock: (clock) => {
        set({
            clock,
        })
    },

    switchClock: () => {
        const { clock } = get()
        let newClock: Clock | null = null

        if (clock && clock.activeColor) {
            const color = clock.activeColor

            const elapsed = clock.lastTickAt ? Date.now() - clock.lastTickAt : 0
            newClock = {
                ...clock,
                [color]: clock[color] - elapsed + clock.increment,
                activeColor: color === "white" ? "black" : "white",
                lastTickAt: Date.now(),
            }
        }

        set({
            clock: newClock,
        })
    },

    stopClock: ({ reason, result }) => {
        const { clock } = get()
        set({
            clock: clock
                ? {
                      ...clock,
                      activeColor: null,
                      lastTickAt: null,
                      ...(reason === "Timeout" && {
                          [result === "white_won" ? "black" : "white"]: 0,
                      }),
                  }
                : null,
        })
    },

    rollbackClock: (ts) => {
        const { clock } = get()
        if (!clock) return
        set({
            clock: {
                activeColor: clock.activeColor === "black" ? "white" : "black",
                white: ts.whiteTimeLeft,
                black: ts.blackTimeLeft,
                lastTickAt: ts.lastMoveAt ?? ts.gameStartedAt,
                increment: clock.increment,
            },
        })
    },

    resetClock() {
        set({
            clock: null,
        })
    },
})
