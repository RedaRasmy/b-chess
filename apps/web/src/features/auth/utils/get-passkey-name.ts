import { getAuthenticatorName, Passkey } from '@better-auth/passkey';

export function getPasskeyName(passkey: Passkey) {
    return passkey.name || getAuthenticatorName(passkey.aaguid) || 'Passkey';
}
