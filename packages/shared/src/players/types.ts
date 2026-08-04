export type TopPlayer = {
    userId: string
    wins: number
    losses: number
    draws: number
    rating: number
    image: string | null
    username: string
}

export type PlayerStatus = "connected" | "disconnected"

export type PlayerConnectionState = {
    status: PlayerStatus
    disconnectedAt?: number
}
