export function Record({
    wins,
    losses,
    draws,
}: {
    wins: number
    losses: number
    draws: number
}) {
    return (
        <div
            className="flex items-center gap-2.5 text-xs"
            style={{
                fontFamily: "'JetBrains Mono', monospace",
            }}
        >
            <span className="text-green-500">{wins}W</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-destructive">{losses}L</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-yellow-400">{draws}D</span>
        </div>
    )
}
