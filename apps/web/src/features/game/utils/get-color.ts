import { PieceColor } from "@/features/game/types"
import { Color } from "chess.js"

export function getColorName(color: Color | PieceColor): PieceColor {
    if (color === "w" || color === "white") return "white"
    return "black"
}

export function getColor(color: Color | PieceColor): Color {
    if (color === "w" || color === "white") return "w"
    return "b"
}

export function getOppositeColor(color: Color | PieceColor): Color {
    if (color === "w" || color === "white") return "b"
    return "w"
}
