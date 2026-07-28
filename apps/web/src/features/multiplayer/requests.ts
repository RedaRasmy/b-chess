import { api } from "@/lib/api"

export async function fetchIsMatching() {
    const res = await api.get<{ isMatching: boolean }>(
        "/multiplayer/isMatching",
    )

    return res.data.isMatching
}
