import { translate } from '../../i18n/index.ts'

export const AUTH_API_PATH = {
    passwordLogin: '/api/auth/login',
    dappLogin: '/api/auth/address_login',
} as const

export const AUTH_ERROR_MESSAGE = {
    tokenUnavailable: 'auth.tokenUnavailable',
    dappUnavailable: 'auth.dappUnavailable',
    dappSessionChanged: 'auth.dappSessionChanged',
} as const

export function shouldUseTemporaryDappLogin(): boolean {
    return Boolean(import.meta.env?.DEV)
        && !(import.meta.env?.VITE_BASE_URL ?? '').trim()
}

export function translateAuthErrorMessage(message: (typeof AUTH_ERROR_MESSAGE)[keyof typeof AUTH_ERROR_MESSAGE]): string {
    return translate(message)
}
