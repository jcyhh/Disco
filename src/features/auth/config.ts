import { translate } from '../../i18n/index.ts'

export const AUTH_API_PATH = {
    passwordLogin: '/api/auth/login',
    dappLogin: '/api/auth/login',
} as const

export const AUTH_ERROR_MESSAGE = {
    tokenUnavailable: 'auth.tokenUnavailable',
    dappUnavailable: 'auth.dappUnavailable',
    dappSessionChanged: 'auth.dappSessionChanged',
} as const

// Keep these codes stable so screenshots can identify the failed step in any language.
export const AUTH_STARTUP_STAGE = {
    walletDetection: 'AUTH-01',
    walletNetwork: 'AUTH-02',
    walletConnection: 'AUTH-03',
    walletSignature: 'AUTH-04',
    loginService: 'AUTH-05',
    session: 'AUTH-06',
} as const

export type AuthStartupStage = (typeof AUTH_STARTUP_STAGE)[keyof typeof AUTH_STARTUP_STAGE]
export type ReportAuthStartupStage = (stage: AuthStartupStage) => void

export class DappLoginError extends Error {
    readonly messageKey: string
    readonly responseMessage?: string
    readonly httpStatus?: number

    constructor(messageKey: string, responseMessage?: string, httpStatus?: number) {
        super(messageKey)
        this.messageKey = messageKey
        this.responseMessage = responseMessage
        this.httpStatus = httpStatus
    }
}

export function shouldUseTemporaryDappLogin(): boolean {
    return Boolean(import.meta.env?.DEV)
        && !(import.meta.env?.VITE_BASE_URL ?? '').trim()
}

export function translateAuthErrorMessage(message: (typeof AUTH_ERROR_MESSAGE)[keyof typeof AUTH_ERROR_MESSAGE]): string {
    return translate(message)
}
