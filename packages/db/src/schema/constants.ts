export const TIMER_OPTIONS = [
    "bullet 1+0",
    "bullet 2+1",
    "blitz 3+0",
    "blitz 3+2",
    "blitz 5+0",
    "blitz 5+3",
    "rapid 10+0",
    "rapid 10+5",
    "rapid 15+10",
] as const

export const GAMEOVER_REASONS = [
    "Checkmate",
    "Timeout",
    "Fifty moves rule",
    "Insufficient material",
    "Stalemate",
    "Threefold repetition",
    "Resignation",
    "Agreement",
] as const

export type TimerOption = (typeof TIMER_OPTIONS)[number]
export type GameoverReason = (typeof GAMEOVER_REASONS)[number]
