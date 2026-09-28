export default function Page() {
    return (
        <div className="mx-auto max-w-3xl py-3 space-y-3">
            <h1 className="text-2xl text-primary font-mono font-semibold">Terms of Service</h1>
            <ul className="text-muted-foreground space-y-1">
                <li>- You must be 13 or older.</li>
                <li>- Don't cheat (no engines, no outside help during games).</li>
                <li>- Don't use offensive usernames.</li>
                <li>
                    - I can suspend or delete accounts, or remove content, at any time, including if
                    you break these rules.
                </li>
                <li>
                    - This is a hobby project provided "as is". It may go down, have bugs, or lose
                    data (games, ratings), and I'm not liable for that.
                </li>
                <li>
                    - I may update these terms. Continuing to use the site means you accept the
                    changes.
                </li>
            </ul>
            <footer className="text-sm text-muted-foreground mt-6">
                Last updated: September 2026
            </footer>
        </div>
    );
}
