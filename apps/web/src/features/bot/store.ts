import { useGameStore } from "@/features/game/game-store"
import { PieceColor, PlayerInfo } from "@/features/game/types"
import { Square } from "chess.js"
import { create } from "zustand"

export interface BotState {
    difficulty: number
    botColor: PieceColor
    isThinking: boolean
    engine: Worker | null
    engineReady: boolean
    lastConfig: {
        difficulty: number
        playerColor: PieceColor
        timeControl?: { initial: number; increment: number }
        player?: PlayerInfo
    } | null

    // actions
    initEngine: () => void
    destroyEngine: () => void
    startBotGame: (opts: {
        difficulty: number
        playerColor: PieceColor
        timeControl?: { initial: number; increment: number }
        player?: PlayerInfo
    }) => void
    replayBotGame: () => void
    requestBotMove: () => void
}

function getThinkingTime(skill: number): number {
    if (skill <= 2) return 50
    if (skill <= 5) return 100
    return Math.floor(100 + (skill / 20) * 1900)
}

export const ELO_MAP: Record<number, number> = {
    0: 400,
    1: 500,
    2: 600,
    3: 700,
    4: 800,
    5: 900,
    6: 1000,
    7: 1100,
    8: 1200,
    9: 1300,
    10: 1400,
    11: 1500,
    12: 1600,
    13: 1700,
    14: 1800,
    15: 1900,
    16: 2000,
    17: 2100,
    18: 2200,
    19: 2400,
    20: 2600,
}

export const useBotStore = create<BotState>((set, get) => ({
    difficulty: 0,
    botColor: "black",
    isThinking: false,
    engine: null,
    engineReady: false,
    lastConfig: null,

    replayBotGame: () => {
        const { lastConfig, startBotGame } = get()
        if (!lastConfig) return
        startBotGame(lastConfig)
    },

    initEngine: () => {
        const engine = new Worker("/stockfish.js")

        engine.onmessage = (e: MessageEvent<string>) => {
            const line = e.data

            if (line === "readyok") {
                const { difficulty } = get()
                engine.postMessage(
                    "setoption name UCI_LimitStrength value true",
                )
                engine.postMessage(
                    `setoption name UCI_Elo value ${ELO_MAP[difficulty]}`,
                )
                set({ engineReady: true })
                console.log("engine is ready")
            }

            if (line.startsWith("bestmove")) {
                const parts = line.split(" ")
                const move = parts[1]

                if (!move || move === "(none)") {
                    set({ isThinking: false })
                    return
                }

                const from = move.slice(0, 2)
                const to = move.slice(2, 4)
                const promotion = move.length > 4 ? move[4] : undefined

                const game = useGameStore.getState()

                game.makeMove(from as Square, to as Square, promotion)
                set({ isThinking: false })
            }
        }

        engine.postMessage("uci")
        engine.postMessage("isready")

        set({ engine })
    },

    destroyEngine: () => {
        const { engine } = get()
        if (engine) {
            engine.postMessage("quit")
            engine.terminate()
        }
        set({ engine: null, engineReady: false, isThinking: false })
    },

    startBotGame: ({ difficulty, playerColor, timeControl, player }) => {
        set({ lastConfig: { difficulty, playerColor, timeControl } })
        const game = useGameStore.getState()
        const botColor = playerColor === "white" ? "black" : "white"

        const botPlayer = {
            id: "stockfish",
            username: `Stockfish lvl ${difficulty}`,
            avatar: "/images/stockfish.webp",
        }

        const humanPlayer = player ?? {
            id: "player",
            username: "You",
        }

        game.resetGame()
        game.setMode("bot")
        game.setPlayerColor(playerColor)
        game.setPlayers(
            playerColor === "white" ? humanPlayer : botPlayer,
            playerColor === "black" ? humanPlayer : botPlayer,
        )
        game.startClock(timeControl)
        game.setStatus("playing")

        set({ difficulty, botColor })
    },

    requestBotMove: () => {
        const { engine, engineReady, isThinking, difficulty } = get()
        const { chess, status } = useGameStore.getState()

        if (!engine || !engineReady || isThinking || status !== "playing")
            return

        set({ isThinking: true })

        engine.postMessage(`position fen ${chess.fen()}`)
        engine.postMessage(`go movetime ${getThinkingTime(difficulty)}`)
    },
}))
