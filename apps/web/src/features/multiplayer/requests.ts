import { api } from "@/lib/api"

export async function fetchIsMatching() {
    const res = await api.get<{ isMatching: boolean }>(
        "/multiplayer/isMatching",
    )

    return res.data.isMatching
}

export async function fetchIsPlaying() {
    const res = await api.get<{ isPlaying: boolean }>("/multiplayer/isPlaying")

    return res.data.isPlaying
}
