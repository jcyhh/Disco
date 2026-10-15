import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'

import { APP_CONFIG } from '../src/config/app.ts'
import { initializeAuthenticatedDappSession, startAuthFlow } from '../src/features/auth/startup.ts'
import { clearAuthSession, completeLogin, logout } from '../src/features/auth/session.ts'
import { registerAppRouteReplacer } from '../src/router/bridge.ts'
import { ROUTE_PATH } from '../src/router/routes.ts'
import { readDappContract } from '../src/services/dapp/contract.ts'
import { detectDappProvider, getDappProvider, getDappWalletClient, resetDappProviderCache } from '../src/services/dapp/provider.ts'
import { getToken } from '../src/services/storage/token.ts'
import { uploadImageWithFlutter } from '../src/services/upload/flutter.ts'
import { useUserStore } from '../src/stores/user/store.ts'

test('static page mode requires both the Vite development environment and an explicit flag', async () => {
    const source = await readFile(new URL('../src/config/app.ts', import.meta.url), 'utf8')
    for (const [env, expected] of [
        [{ DEV: true, VITE_STATIC_PAGE_MODE: '1' }, true],
        [{ DEV: true, VITE_STATIC_PAGE_MODE: '0' }, false],
        [{ DEV: true }, false],
        [{ DEV: false, PROD: true, VITE_STATIC_PAGE_MODE: '1' }, false],
    ]) {
        const compiled = await transform(source, {
            loader: 'ts', format: 'esm',
            define: { 'import.meta.env': JSON.stringify(env) },
        })
        const code = compiled.code.replaceAll('"./deployment.ts"', JSON.stringify(new URL('../src/config/deployment.ts', import.meta.url).href))
        const config = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
        assert.equal(config.APP_CONFIG.enableStaticPageMode, expected)
    }
})

test('static startup and logout stay signed in without touching wallets or stored credentials', async () => {
    const previousMode = APP_CONFIG.enableStaticPageMode
    const previousWindow = globalThis.window
    const previousState = useUserStore.getState()
    const storage = new Map([['TOKEN', 'real-session'], ['WALLET_ADDRESS', 'real-wallet']])
    let walletCalls = 0
    const destinations = []
    const unregister = registerAppRouteReplacer((path) => destinations.push(path))
    globalThis.window = {
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, value),
            removeItem: (key) => storage.delete(key),
        },
        ethereum: { request: async () => { walletCalls++; throw new Error('Unexpected wallet request') } },
    }
    APP_CONFIG.enableStaticPageMode = true
    try {
        const freshStore = await import('../src/stores/user/store.ts?static-page-mode')
        assert.equal(freshStore.useUserStore.getState().isAuthenticated, true)
        assert.equal(freshStore.useUserStore.getState().isSessionReady, true)

        await initializeAuthenticatedDappSession()
        assert.deepEqual(destinations, [])
        await startAuthFlow()
        completeLogin('do-not-store-this')
        clearAuthSession()
        logout()
        useUserStore.getState().markSignedOut()

        assert.equal(useUserStore.getState().isAuthenticated, true)
        assert.equal(useUserStore.getState().isSessionReady, true)
        assert.deepEqual(destinations, [ROUTE_PATH.home, ROUTE_PATH.home, ROUTE_PATH.home])
        assert.equal(walletCalls, 0)
        assert.equal(getToken(), 'real-session')
        assert.equal(storage.get('WALLET_ADDRESS'), 'real-wallet')
    } finally {
        unregister()
        APP_CONFIG.enableStaticPageMode = previousMode
        globalThis.window = previousWindow
        useUserStore.setState(previousState, true)
    }
})

test('static mode blocks cached wallet clients, RPC reads and Flutter uploads before transport', async () => {
    const previousMode = APP_CONFIG.enableStaticPageMode
    const previousWindow = globalThis.window
    let requests = 0
    const ethereum = { request: async () => { requests++; throw new Error('Unexpected RPC') } }
    globalThis.window = {
        ethereum,
        __FROM_FLUTTER__: true,
        Flutter: { postMessage: () => { requests++ } },
    }
    resetDappProviderCache()
    try {
        APP_CONFIG.enableStaticPageMode = false
        getDappWalletClient()
        APP_CONFIG.enableStaticPageMode = true
        assert.equal(await detectDappProvider(), undefined)
        assert.throws(() => getDappProvider(), /paused/)
        assert.throws(() => getDappWalletClient(), /paused/)
        await assert.rejects(readDappContract({
            address: '0x0000000000000000000000000000000000000001',
            abi: [], functionName: 'balanceOf',
        }), /paused/)
        await assert.rejects(uploadImageWithFlutter(), /paused/)
        assert.equal(requests, 0)

        APP_CONFIG.enableStaticPageMode = false
        assert.equal(getDappProvider(), ethereum)
    } finally {
        APP_CONFIG.enableStaticPageMode = previousMode
        globalThis.window = previousWindow
        resetDappProviderCache()
    }
})
