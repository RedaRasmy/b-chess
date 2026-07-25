import axios from "axios"

const apiURL = process.env.NEXT_PUBLIC_BACKEND_API_URL

if (!apiURL) {
    throw new Error("NEXT_PUBLIC_BACKEND_API_URL env variable is missing")
}

export const api = axios.create({
    baseURL: apiURL + "",
    withCredentials: true,
})
