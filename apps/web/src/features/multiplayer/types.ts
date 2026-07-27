import type { Socket } from "socket.io-client"
import type { ServerToClientEvents, ClientToServerEvents } from "@bchess/shared"

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>
