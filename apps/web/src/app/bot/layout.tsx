"use client"
import { ReactNode, useEffect } from "react"

export default function Layout({ children }: { children: ReactNode }) {
    console.log("hello from tempalte")
    useEffect(() => {
        fetch("/stockfish.js").catch(() => {})
        fetch("/stockfish.wasm").catch(() => {})
    }, [])
    return children
}
