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
import { useUserStore } from '../../stores/user/store.ts'

import { getAuthSessionVersion } from './lifecycle.ts'

import {
    clearAuthSession,
    logout,
} from './session.ts'

export const AUTH_STARTUP_RESULT = {
    completed: 'completed',
    walletRequired: 'walletRequired',
} as const

export type AuthStartupResult =
    (typeof AUTH_STARTUP_RESULT)[keyof typeof AUTH_STARTUP_RESULT]

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

async function startDappAuthFlow(token: string): Promise<void> {
    if (token) {
        const version = getAuthSessionVersion()
        await resumeStoredDappSession()
        if (version !== getAuthSessionVersion() || token !== getToken()) return
        useUserStore.getState().markSessionReady()
        replaceAppRoute(ROUTE_PATH.home)
        return
    }

    const { loginWithDapp } = await import('./dapp.ts')
    await loginWithDapp()
}

async function restartDappLoginAfterStoredSessionChange(): Promise<void> {
    const {
        loginWithDapp,
        resetDappLoginAttempt,
    } = await import('./dapp.ts')

    resetDappLoginAttempt()
    clearAuthSession()
    const version = getAuthSessionVersion()

    try {
        await loginWithDapp()
    } catch {
        if (version === getAuthSessionVersion()) logout()
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

export async function startAuthFlow(): Promise<AuthStartupResult> {
    if (APP_CONFIG.enableStaticPageMode) {
        useUserStore.getState().markSignedIn()
        replaceAppRoute(ROUTE_PATH.home)
        return AUTH_STARTUP_RESULT.completed
    }

    const token = getToken()
    const version = getAuthSessionVersion()
    const isCurrent = () => version === getAuthSessionVersion() && token === getToken()

    if (APP_CONFIG.loginMode === APP_LOGIN_MODE.account) {
        useUserStore.getState().markSessionReady()
        replaceAppRoute(token ? ROUTE_PATH.home : ROUTE_PATH.login)
        return AUTH_STARTUP_RESULT.completed
    }

    let hasDappProvider = false

    if (!shouldSkipDelayedDappDetection()) {
        hasDappProvider = await detectStartupDappProvider()
    }

    if (!isCurrent()) return AUTH_STARTUP_RESULT.completed

    if (!hasDappProvider && APP_CONFIG.loginMode === APP_LOGIN_MODE.dapp) {
        hasDappProvider = await detectStartupDappProvider()

        if (!isCurrent()) return AUTH_STARTUP_RESULT.completed

        if (!hasDappProvider) {
            return AUTH_STARTUP_RESULT.walletRequired
        }
    }

    if (hasDappProvider) {
        try {
            await startDappAuthFlow(token)
        } catch {
            if (!isCurrent()) return AUTH_STARTUP_RESULT.completed

            if (token) {
                await restartDappLoginAfterStoredSessionChange()

                return AUTH_STARTUP_RESULT.completed
            }

            logout()
        }

        return AUTH_STARTUP_RESULT.completed
    }

    if (token) {
        useUserStore.getState().markSessionReady()
        replaceAppRoute(ROUTE_PATH.home)
    } else {
        replaceAppRoute(ROUTE_PATH.login)
    }

    return AUTH_STARTUP_RESULT.completed
}
