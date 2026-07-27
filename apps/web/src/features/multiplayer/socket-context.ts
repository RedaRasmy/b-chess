import { ClientSocket } from "@/features/multiplayer/types"
import { createContext } from "react"

export type SocketContext = {
    socket: ClientSocket
}

export const SocketContext = createContext<SocketContext | null>(null)
