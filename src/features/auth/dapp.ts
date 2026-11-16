import {
    connectDappWallet,
    initializeDappWallet,
    signDappMessage,
    startDappWalletListeners,
    stopDappWalletListeners,
} from '../../services/dapp/index.ts'
import type { DappWalletConnection } from '../../services/dapp/types.ts'
import { HttpError } from '../../services/http/error.ts'
import { assertNotAborted } from '../../shared/async/assertNotAborted.ts'
import {
    getReferralCode,
    getWalletAddress,
} from '../../services/storage/index.ts'

import { requestDappLogin } from './api.ts'
import {
    AUTH_ERROR_MESSAGE,
    AUTH_STARTUP_STAGE,
    DappLoginError,
    type ReportAuthStartupStage,
    shouldUseTemporaryDappLogin,
    translateAuthErrorMessage,
} from './config.ts'
import { getAuthSessionVersion, registerAuthLogoutCleanup } from './lifecycle.ts'
import { clearAuthSession, completeLogin, logout } from './session.ts'

let removeDappLogoutCleanup: (() => void) | undefined
let dappLoginAttempt = 0
let pendingDappLogin: {
    attempt: number
    sessionVersion: number
    signal?: AbortSignal
    promise: Promise<void>
} | undefined

export function resetDappLoginAttempt(): void {
    dappLoginAttempt += 1
}

function handleDappAccountsChanged(): void {
    resetDappLoginAttempt()
    logout()
}

function handleDappChainChanged(): void {
    resetDappLoginAttempt()
    logout()
}

function stopDappAuthListeners(): void {
    removeDappLogoutCleanup?.()
    removeDappLogoutCleanup = undefined
    stopDappWalletListeners()
}

function startDappAuthListeners(): void {
    stopDappAuthListeners()
    startDappWalletListeners({
        onAccountsChanged: handleDappAccountsChanged,
        onChainChanged: handleDappChainChanged,
    })
    removeDappLogoutCleanup = registerAuthLogoutCleanup(stopDappAuthListeners)
}

function isSameDappAddress(first: string, second: string): boolean {
    return first.toLowerCase() === second.toLowerCase()
}

async function initializeDappAuthSession(options: {
    verifyStoredAddress?: boolean
    assertCurrent?: () => void
    reportStage?: ReportAuthStartupStage
} = {}): Promise<DappWalletConnection> {
    options.reportStage?.(AUTH_STARTUP_STAGE.walletNetwork)
    const initialized = await initializeDappWallet({ assertCurrent: options.assertCurrent }).catch((error: unknown) => {
        options.assertCurrent?.()
        throw new DappLoginError(isWalletRejection(error) ? '已拒绝切换网络' : '钱包网络检查失败')
    })
    options.assertCurrent?.()

    if (!initialized) {
        options.reportStage?.(AUTH_STARTUP_STAGE.walletDetection)
        throw new DappLoginError(AUTH_ERROR_MESSAGE.dappUnavailable)
    }

    const storedAddress = options.verifyStoredAddress
        ? getWalletAddress()
        : ''
    options.reportStage?.(AUTH_STARTUP_STAGE.walletConnection)
    const connection = await connectDappWallet({
        assertCurrent: options.assertCurrent,
        useInitializedChain: true,
    }).catch((error: unknown) => {
        options.assertCurrent?.()
        throw new DappLoginError(isWalletRejection(error) ? '已拒绝钱包连接' : '钱包连接失败')
    })
    options.assertCurrent?.()

    options.reportStage?.(AUTH_STARTUP_STAGE.session)
    if (storedAddress && !isSameDappAddress(storedAddress, connection.address)) {
        throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappSessionChanged))
    }

    startDappAuthListeners()
    return connection
}

function isWalletRejection(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 4001
}

async function performDappLogin(
    attempt: number,
    sessionVersion: number,
    signal?: AbortSignal,
    reportStage?: ReportAuthStartupStage,
): Promise<void> {
    function assertCurrent() {
        if (signal) assertNotAborted(signal)
        if (attempt !== dappLoginAttempt || sessionVersion !== getAuthSessionVersion()) {
            reportStage?.(AUTH_STARTUP_STAGE.session)
            throw new DappLoginError(AUTH_ERROR_MESSAGE.dappSessionChanged)
        }
    }

    assertCurrent()
    const { address } = await initializeDappAuthSession({ assertCurrent, reportStage })
    assertCurrent()
    reportStage?.(AUTH_STARTUP_STAGE.walletSignature)
    const signResult = await signDappMessage('Login', { account: address, assertCurrent }).catch((error: unknown) => {
        assertCurrent()
        throw new DappLoginError(isWalletRejection(error) ? '已拒绝登录签名' : '签名失败')
    })
    assertCurrent()

    if (shouldUseTemporaryDappLogin()) {
        reportStage?.(AUTH_STARTUP_STAGE.session)
        completeLogin('token')
        return
    }

    reportStage?.(AUTH_STARTUP_STAGE.loginService)
    const response = await requestDappLogin({
        referralCode: getReferralCode(),
        address,
        signature: signResult.signature,
        timestamp: signResult.timestamp,
    }, signal).catch((error: unknown) => {
        assertCurrent()
        if (error instanceof HttpError) {
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                throw new DappLoginError('请求超时')
            }
            if (error.status === undefined) throw new DappLoginError('网络错误')

            // The login API returns user-facing business errors as plain text.
            const responseMessage = typeof error.data === 'string' ? error.data.trim() : ''
            if (
                [400, 401, 422].includes(error.status)
                && responseMessage
                && responseMessage.length <= 160
                && !responseMessage.includes('<')
            ) {
                throw new DappLoginError('登录失败', responseMessage, error.status)
            }
            throw new DappLoginError('登录失败', undefined, error.status)
        }
        throw new DappLoginError('登录失败')
    })

    assertCurrent()

    if (typeof response?.token !== 'string' || !response.token.trim()) {
        throw new DappLoginError(AUTH_ERROR_MESSAGE.tokenUnavailable)
    }
    reportStage?.(AUTH_STARTUP_STAGE.session)
    completeLogin(response.token)
}

export function loginWithDapp(signal?: AbortSignal, reportStage?: ReportAuthStartupStage): Promise<void> {
    const sessionVersion = getAuthSessionVersion()
    const previous = pendingDappLogin?.signal?.aborted ? undefined : pendingDappLogin
    if (previous?.attempt === dappLoginAttempt && previous.sessionVersion === sessionVersion) {
        return previous.promise
    }

    const attempt = ++dappLoginAttempt
    const pending = { attempt, sessionVersion, signal, promise: Promise.resolve() }
    const onAbort = () => {
        if (pendingDappLogin === pending && sessionVersion === getAuthSessionVersion()) clearAuthSession()
    }

    signal?.addEventListener('abort', onAbort, { once: true })
    pending.promise = (async () => {
        // Wait for a live wallet prompt before signing for a different account.
        // An expired startup can be retried even if the wallet never responds.
        if (previous) await previous.promise.catch(() => undefined)
        await performDappLogin(attempt, sessionVersion, signal, reportStage)
    })().finally(() => {
        signal?.removeEventListener('abort', onAbort)
        if (pendingDappLogin === pending) pendingDappLogin = undefined
    })
    pendingDappLogin = pending
    return pending.promise
}

export async function resumeDappAuthSession(signal?: AbortSignal, reportStage?: ReportAuthStartupStage): Promise<void> {
    const sessionVersion = getAuthSessionVersion()
    if (signal) assertNotAborted(signal)
    await initializeDappAuthSession({
        verifyStoredAddress: true,
        reportStage,
        assertCurrent() {
            if (signal) assertNotAborted(signal)
            if (sessionVersion !== getAuthSessionVersion()) {
                throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappSessionChanged))
            }
        },
    })
}
