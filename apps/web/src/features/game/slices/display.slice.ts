import { DisplaySlice, GameSlice } from "@/features/game/types"
import { DEFAULT_POSITION } from "chess.js"

export const displaySlice: GameSlice<DisplaySlice> = (set, get) => ({
    viewIndex: null,
    displayFen: DEFAULT_POSITION,
    moveHistory: [],

    goToMove: (index) => {
        const { moveHistory } = get()

        console.log("go to move: ", index)

        if (index === null) {
            set({
                viewIndex: null,
                displayFen: DEFAULT_POSITION,
            })
        } else {
            const move = moveHistory.at(index)
            if (!move) {
                console.warn("Move not found, index=", index)
                return
            }

            const viewIndex = index < 0 ? moveHistory.length + index : index

            set({ viewIndex, displayFen: move.after })
        }
    },

    goToStart: () => {
        get().goToMove(null)
    },

    goToEnd: () => {
        get().goToMove(-1)
    },

    stepBack: () => {
        const { viewIndex } = get()

        if (viewIndex === null) return

        if (viewIndex === 0) {
            get().goToStart()
        } else {
            get().goToMove(viewIndex - 1)
        }
    },

    stepForward: () => {
        const { viewIndex, moveHistory } = get()

        if (viewIndex === null) {
            get().goToMove(0)
            return
        }

        const isLastMove = moveHistory.length - 1 === viewIndex

        if (isLastMove) return

        get().goToMove(viewIndex + 1)
    },

    resetDisplay() {
        set({
            displayFen: DEFAULT_POSITION,
            viewIndex: null,
            moveHistory: [],
        })
    },

    rollbackDisplay() {
        const { moveHistory } = get()

        get().stepBack()

        set({
            moveHistory: moveHistory.slice(0, -1),
        })

        get().goToEnd()
    },

    setDisplay(history, index = -1) {
        get().resetDisplay()
        set({
            moveHistory: history,
        })

        get().goToMove(index)
    },
})
