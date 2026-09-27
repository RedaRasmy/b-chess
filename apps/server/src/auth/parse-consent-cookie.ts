export function parseConsentCookie(cookieHeader: string | null | undefined): boolean {
    if (!cookieHeader) return false;
    const entry = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('cookie_consent='));
    return entry?.split('=')[1] === 'granted';
}
