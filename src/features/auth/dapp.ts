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
} = {}): Promise<DappWalletConnection> {
    const initialized = await initializeDappWallet({ attachListeners: false })

    if (!initialized) {
        throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappUnavailable))
    }

    const storedAddress = options.verifyStoredAddress
        ? getWalletAddress()
        : ''
    const connection = await connectDappWallet()

    if (storedAddress && !isSameDappAddress(storedAddress, connection.address)) {
        throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappSessionChanged))
    }

    startDappAuthListeners()
    return connection
}

export async function loginWithDapp(): Promise<void> {
    const attempt = ++dappLoginAttempt
    const sessionVersion = getAuthSessionVersion()
    const { address } = await initializeDappAuthSession()
    const signResult = await signDappMessage('Login')

    if (attempt !== dappLoginAttempt || sessionVersion !== getAuthSessionVersion()) {
        throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappSessionChanged))
    }

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

    if (attempt !== dappLoginAttempt || sessionVersion !== getAuthSessionVersion()) {
        throw new Error(translateAuthErrorMessage(AUTH_ERROR_MESSAGE.dappSessionChanged))
    }

    completeLogin(response.token)
}

export async function resumeDappAuthSession(): Promise<void> {
    await initializeDappAuthSession({ verifyStoredAddress: true })
}
