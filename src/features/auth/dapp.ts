import {
    connectDappWallet,
    initializeDappWallet,
    signDappMessage,
    startDappWalletListeners,
    stopDappWalletListeners,
} from '../../services/dapp/index.ts'
import type { DappWalletConnection } from '../../services/dapp/types.ts'
import {
    getReferralCode,
    getWalletAddress,
} from '../../services/storage/index.ts'

import { requestDappLogin } from './api.ts'
import {
    AUTH_ERROR_MESSAGE,
    shouldUseTemporaryDappLogin,
    translateAuthErrorMessage,
} from './config.ts'
import { getAuthSessionVersion, registerAuthLogoutCleanup } from './lifecycle.ts'
import { completeLogin, logout } from './session.ts'

let removeDappLogoutCleanup: (() => void) | undefined
let dappLoginAttempt = 0
let pendingDappLogin: {
    attempt: number
    sessionVersion: number
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
} = {}): Promise<DappWalletConnection> {
    const initialized = await initializeDappWallet({ attachListeners: false })
    options.assertCurrent?.()

    if (!initialized) {
        throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappUnavailable))
    }

    const storedAddress = options.verifyStoredAddress
        ? getWalletAddress()
        : ''
    const connection = await connectDappWallet({ assertCurrent: options.assertCurrent })
    options.assertCurrent?.()

    if (storedAddress && !isSameDappAddress(storedAddress, connection.address)) {
        throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappSessionChanged))
    }

    startDappAuthListeners()
    return connection
}

async function performDappLogin(attempt: number, sessionVersion: number): Promise<void> {
    function assertCurrent() {
        if (attempt !== dappLoginAttempt || sessionVersion !== getAuthSessionVersion()) {
            throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappSessionChanged))
        }
    }

    assertCurrent()
    const { address } = await initializeDappAuthSession({ assertCurrent })
    assertCurrent()
    const signResult = await signDappMessage('Login', { account: address, assertCurrent })
    assertCurrent()

    if (shouldUseTemporaryDappLogin()) {
        completeLogin('token')
        return
    }

    const response = await requestDappLogin({
        referralCode: getReferralCode(),
        address,
        signature: signResult.signature,
        timestamp: signResult.timestamp,
    })

    assertCurrent()

    completeLogin(response.token)
}

export function loginWithDapp(): Promise<void> {
    const sessionVersion = getAuthSessionVersion()
    if (pendingDappLogin?.attempt === dappLoginAttempt && pendingDappLogin.sessionVersion === sessionVersion) {
        return pendingDappLogin.promise
    }

    const previous = pendingDappLogin?.promise
    const attempt = ++dappLoginAttempt
    const pending = { attempt, sessionVersion, promise: Promise.resolve() }
    pending.promise = (async () => {
        // An injected wallet signature cannot be cancelled. Finish the old prompt
        // before a new account starts signing, rather than queueing wallet popups.
        if (previous) await previous.catch(() => undefined)
        await performDappLogin(attempt, sessionVersion)
    })().finally(() => {
        if (pendingDappLogin === pending) pendingDappLogin = undefined
    })
    pendingDappLogin = pending
    return pending.promise
}

export async function resumeDappAuthSession(): Promise<void> {
    const sessionVersion = getAuthSessionVersion()
    await initializeDappAuthSession({
        verifyStoredAddress: true,
        assertCurrent() {
            if (sessionVersion !== getAuthSessionVersion()) {
                throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappSessionChanged))
            }
        },
    })
}
