import {
    APP_CONFIG,
    APP_LOGIN_MODE,
} from '../../config/index.ts'
import { replaceAppRoute } from '../../router/bridge.ts'
import { ROUTE_PATH } from '../../router/routes.ts'
import {
    isDappProviderExpected,
    isFlutterHost,
} from '../../services/platform/index.ts'
import { getToken } from '../../services/storage/index.ts'
import { assertNotAborted } from '../../shared/async/assertNotAborted.ts'
import { useUserStore } from '../../stores/user/store.ts'

import {
    AUTH_ERROR_MESSAGE,
    AUTH_STARTUP_STAGE,
    DappLoginError,
    type AuthStartupStage,
    type ReportAuthStartupStage,
} from './config.ts'
import { getAuthSessionVersion } from './lifecycle.ts'

import {
    clearAuthSession,
    logout,
} from './session.ts'

export const AUTH_STARTUP_RESULT = {
    completed: 'completed',
    walletRequired: 'walletRequired',
    failed: 'failed',
} as const

const AUTH_STARTUP_TIMEOUT = 45_000

export type AuthStartupResult =
    (typeof AUTH_STARTUP_RESULT)[keyof typeof AUTH_STARTUP_RESULT]
    | { stage: AuthStartupStage; messageKey: string; responseMessage?: string; httpStatus?: number }

let resumeStoredDappSessionPromise: Promise<void> | undefined
let resumeStoredDappSessionVersion: number | undefined

async function detectStartupDappProvider(): Promise<boolean> {
    const { detectDappProvider } = await import('../../services/dapp/provider.ts')

    return Boolean(await detectDappProvider({
        waitForDelayedProvider: true,
    }))
}

async function resumeStoredDappSession(): Promise<void> {
    const version = getAuthSessionVersion()

    if (!resumeStoredDappSessionPromise || resumeStoredDappSessionVersion !== version) {
        resumeStoredDappSessionVersion = version
        resumeStoredDappSessionPromise = (async () => {
            const { resumeDappAuthSession } = await import('./dapp.ts')
            await resumeDappAuthSession()
        })().finally(() => {
            if (resumeStoredDappSessionVersion === version) {
                resumeStoredDappSessionPromise = undefined
            }
        })
    }

    return resumeStoredDappSessionPromise
}

async function loadAuthenticatedUserProfile(): Promise<void> {
    try {
        const { getCurrentUser } = await import('../user/api.ts')
        await getCurrentUser()
    } catch {
        // HTTP interceptors own auth failures; startup should not block the app here.
    }
}

async function startDappAuthFlow(
    token: string,
    signal: AbortSignal,
    reportStage: ReportAuthStartupStage,
): Promise<AuthStartupResult> {
    const { loginWithDapp, resumeDappAuthSession } = await import('./dapp.ts')
    assertNotAborted(signal)

    if (token) {
        const version = getAuthSessionVersion()
        await resumeDappAuthSession(signal, reportStage)
        assertNotAborted(signal)
        if (version !== getAuthSessionVersion() || token !== getToken()) return AUTH_STARTUP_RESULT.failed
        useUserStore.getState().markSessionReady()
        replaceAppRoute(ROUTE_PATH.home)
        return AUTH_STARTUP_RESULT.completed
    }

    await loginWithDapp(signal, reportStage)
    return AUTH_STARTUP_RESULT.completed
}

async function restartDappLoginAfterStoredSessionChange(
    signal: AbortSignal,
    reportStage: ReportAuthStartupStage,
): Promise<void> {
    const {
        loginWithDapp,
        resetDappLoginAttempt,
    } = await import('./dapp.ts')
    assertNotAborted(signal)

    resetDappLoginAttempt()
    clearAuthSession()
    const version = getAuthSessionVersion()

    try {
        await loginWithDapp(signal, reportStage)
    } catch (error) {
        if (!signal.aborted && version === getAuthSessionVersion()) clearAuthSession()
        throw error
    }
}

function shouldSkipDelayedDappDetection(): boolean {
    return isFlutterHost() && !isDappProviderExpected()
}

export async function initializeAuthenticatedDappSession(): Promise<AuthStartupResult> {
    if (APP_CONFIG.enableStaticPageMode) {
        useUserStore.getState().markSignedIn()
        return AUTH_STARTUP_RESULT.completed
    }

    const token = getToken()
    const version = getAuthSessionVersion()
    const isCurrent = () => version === getAuthSessionVersion() && token === getToken()

    if (!token) return AUTH_STARTUP_RESULT.completed

    try {
        if (APP_CONFIG.loginMode === APP_LOGIN_MODE.account) {
            await loadAuthenticatedUserProfile()
        } else {
            const hasDappProvider = !shouldSkipDelayedDappDetection()
                && await detectStartupDappProvider()

            if (!isCurrent()) return AUTH_STARTUP_RESULT.completed

            if (hasDappProvider) {
                await resumeStoredDappSession()
            } else if (APP_CONFIG.loginMode === APP_LOGIN_MODE.dapp) {
                logout()
                return AUTH_STARTUP_RESULT.walletRequired
            }

            if (!isCurrent()) return AUTH_STARTUP_RESULT.completed
            await loadAuthenticatedUserProfile()
        }

        if (isCurrent()) useUserStore.getState().markSessionReady()
    } catch {
        if (isCurrent()) logout()
    }

    return AUTH_STARTUP_RESULT.completed
}

async function runSplashAuthFlow(signal: AbortSignal, reportStage: ReportAuthStartupStage): Promise<AuthStartupResult> {
    if (APP_CONFIG.enableStaticPageMode) {
        useUserStore.getState().markSignedIn()
        replaceAppRoute(ROUTE_PATH.home)
        return AUTH_STARTUP_RESULT.completed
    }

    const token = getToken()
    const version = getAuthSessionVersion()
    function assertCurrent() {
        assertNotAborted(signal)
        if (version === getAuthSessionVersion() && token === getToken()) return
        reportStage(AUTH_STARTUP_STAGE.session)
        throw new DappLoginError(AUTH_ERROR_MESSAGE.dappSessionChanged)
    }

    if (APP_CONFIG.loginMode === APP_LOGIN_MODE.account) {
        reportStage(AUTH_STARTUP_STAGE.session)
        useUserStore.getState().markSessionReady()
        replaceAppRoute(token ? ROUTE_PATH.home : ROUTE_PATH.login)
        return AUTH_STARTUP_RESULT.completed
    }

    let hasDappProvider = false

    if (!shouldSkipDelayedDappDetection()) {
        hasDappProvider = await detectStartupDappProvider()
    }

    assertCurrent()

    if (!hasDappProvider && APP_CONFIG.loginMode === APP_LOGIN_MODE.dapp) {
        hasDappProvider = await detectStartupDappProvider()

        assertCurrent()

        if (!hasDappProvider) {
            return AUTH_STARTUP_RESULT.walletRequired
        }
    }

    if (hasDappProvider) {
        const { resetDappProviderCache } = await import('../../services/dapp/provider.ts')
        assertCurrent()

        // A fresh client lets retry bypass viem's deduplication of a hung wallet request.
        signal.addEventListener('abort', resetDappProviderCache, { once: true })
        try {
            return await startDappAuthFlow(token, signal, reportStage)
        } catch (error) {
            assertCurrent()

            if (token) {
                await restartDappLoginAfterStoredSessionChange(signal, reportStage)
                return AUTH_STARTUP_RESULT.completed
            }

            clearAuthSession()
            throw error
        } finally {
            signal.removeEventListener('abort', resetDappProviderCache)
        }
    }

    reportStage(AUTH_STARTUP_STAGE.session)
    if (token) {
        useUserStore.getState().markSessionReady()
        replaceAppRoute(ROUTE_PATH.home)
    } else {
        replaceAppRoute(ROUTE_PATH.login)
    }

    return AUTH_STARTUP_RESULT.completed
}

export async function startAuthFlow(signal?: AbortSignal): Promise<AuthStartupResult> {
    if (signal?.aborted) return AUTH_STARTUP_RESULT.completed

    const controller = new AbortController()
    let stage: AuthStartupStage = AUTH_STARTUP_STAGE.walletDetection
    const reportStage: ReportAuthStartupStage = (current) => { stage = current }
    let stop: (result: AuthStartupResult) => void = () => undefined
    const stopped = new Promise<AuthStartupResult>((resolve) => { stop = resolve })
    const cancel = () => {
        stop(AUTH_STARTUP_RESULT.completed)
        controller.abort()
    }
    signal?.addEventListener('abort', cancel, { once: true })
    const timeout = setTimeout(() => {
        stop({ stage, messageKey: '请求超时' })
        controller.abort()
    }, AUTH_STARTUP_TIMEOUT)

    try {
        const result = await Promise.race([runSplashAuthFlow(controller.signal, reportStage), stopped])
        if (result === AUTH_STARTUP_RESULT.walletRequired) {
            return { stage, messageKey: '请使用钱包环境打开！' }
        }
        if (result === AUTH_STARTUP_RESULT.failed) {
            return { stage, messageKey: AUTH_ERROR_MESSAGE.dappSessionChanged }
        }
        return result
    } catch (error) {
        if (error instanceof DappLoginError) {
            return { stage, messageKey: error.messageKey, responseMessage: error.responseMessage, httpStatus: error.httpStatus }
        }
        return { stage, messageKey: '登录失败' }
    } finally {
        clearTimeout(timeout)
        signal?.removeEventListener('abort', cancel)
    }
}
