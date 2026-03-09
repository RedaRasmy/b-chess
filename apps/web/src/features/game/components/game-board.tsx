import { useGameStore } from "@/features/game/game-store"
import { Square } from "chess.js"
import { Chessboard } from "react-chessboard"

export default function GameBoard() {
    const {
        playerColor,
        displayFen,
        selectSquare,
        selectedSquare,
        legalMoves,
    } = useGameStore()

    function onPieceDrop(from: Square, to: Square) {
        const prevFen = useGameStore.getState().fen
        selectSquare(from)
        selectSquare(to)
        return useGameStore.getState().fen !== prevFen
    }

    const legalMoveStyles = Object.fromEntries(
        legalMoves.map((sq) => [
            sq,
            {
                background:
                    "radial-gradient(circle, color-mix(in oklch, var(--primary) 70%, transparent) 25%, transparent 25%)",
            },
        ]),
    )
    return (
        <Chessboard
            options={{
                boardStyle: {
                    borderRadius: 5,
                },
                darkSquareStyle: {
                    backgroundColor: "var(--secondary)",
                },
                lightSquareStyle: {
                    backgroundColor: "oklch(from var(--primary) l c h / 0.5)",
                },
                darkSquareNotationStyle: {
                    color: "var(--primary)",
                },
                lightSquareNotationStyle: {
                    color: "black",
                },
                boardOrientation: playerColor ?? "white",
                position: displayFen,
                onSquareClick: ({ square }) => selectSquare(square as Square),
                onPieceDrop: ({ sourceSquare, targetSquare }) =>
                    onPieceDrop(sourceSquare as Square, targetSquare as Square),
                squareStyles: {
                    ...legalMoveStyles,
                    ...(selectedSquare && {
                        [selectedSquare]: {
                            backgroundColor:
                                "color-mix(in oklch, var(--primary) 20%, transparent)",
                        },
                    }),
                },
            }}
        />
    )
}
