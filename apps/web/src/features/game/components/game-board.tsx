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
        moveHistory,
        viewIndex,
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

    const selectedSquareStyle = selectedSquare
        ? {
              [selectedSquare]: {
                  backgroundColor:
                      "color-mix(in oklch, var(--primary) 20%, transparent)",
              },
          }
        : {}

    const lastMove = moveHistory.at(viewIndex ?? -1)

    const lastMoveSquareStyle = {
        boxShadow:
            "inset 0 0 0 3px color-mix(in oklch, yellow 40%, transparent)",
    }

    const lastMoveStyle = lastMove
        ? {
              [lastMove.from]: lastMoveSquareStyle,
              [lastMove.to]: lastMoveSquareStyle,
          }
        : {}

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
                onSquareClick: ({ square ,}) => selectSquare(square as Square),
                onPieceDrop: ({ sourceSquare, targetSquare }) =>
                    onPieceDrop(sourceSquare as Square, targetSquare as Square),
                squareStyles: {
                    ...legalMoveStyles,
                    ...selectedSquareStyle,
                    ...lastMoveStyle,
                },
            }}
        />
    )
}
