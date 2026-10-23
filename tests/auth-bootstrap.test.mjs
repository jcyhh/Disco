import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { transform } from 'esbuild'

import { APP_CONFIG } from '../src/config/app.ts'
import { initializeAuthenticatedDappSession, startAuthFlow } from '../src/features/auth/startup.ts'
import { clearAuthSession, completeLogin } from '../src/features/auth/session.ts'
import { resetDappProviderCache } from '../src/services/dapp/provider.ts'
import { stopDappWalletListeners } from '../src/services/dapp/wallet.ts'
import { httpClient } from '../src/services/http/client.ts'
import { getToken } from '../src/services/storage/token.ts'
import { useUserStore } from '../src/stores/user/store.ts'

const address = '0x0000000000000000000000000000000000000001'
const otherAddress = '0x0000000000000000000000000000000000000002'

function setup(ethereum) {
    clearAuthSession()
    stopDappWalletListeners()
    resetDappProviderCache()
    const cache = new Map([['WALLET_ADDRESS', address]])
    globalThis.window = { ethereum, localStorage: {
        getItem: (key) => cache.get(key) ?? null,
        setItem: (key, value) => cache.set(key, value),
        removeItem: (key) => cache.delete(key),
    } }
    completeLogin('stored-token')
    useUserStore.setState({ isSessionReady: false })
    return cache
}

test('business route boundary never renders its page until restoration is ready', async () => {
    const sourceUrl = new URL('../src/features/auth/AuthSessionBoundary.tsx', import.meta.url)
    const source = await readFile(sourceUrl, 'utf8')
    const compiled = await transform(source, { loader: 'tsx', jsx: 'automatic', format: 'esm' })
    const require = createRequire(import.meta.url)
    const code = compiled.code
        .replaceAll('"react/jsx-runtime"', JSON.stringify(pathToFileURL(require.resolve('react/jsx-runtime')).href))
        .replaceAll('"../../i18n/index.ts"', JSON.stringify(new URL('../src/i18n/index.ts', import.meta.url).href))
    const { AuthSessionBoundary } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
    let mounts = 0
    const BusinessPage = () => { mounts += 1; return createElement('main', null, 'private page') }
    const render = (ready) => renderToStaticMarkup(createElement(AuthSessionBoundary, { ready }, createElement(BusinessPage)))
    assert.match(render(false), /role="status"/)
    assert.equal(mounts, 0)
    assert.match(render(true), /private page/)
    assert.equal(mounts, 1)
})

test('wallet restoration holds readiness and authenticated API until the current account is verified', async () => {
    const previousMode = APP_CONFIG.loginMode
    const previousAdapter = httpClient.defaults.adapter
    APP_CONFIG.loginMode = 'dapp'
    let release
    let started
    const accountRequested = new Promise((resolve) => { started = resolve })
    const accounts = new Promise((resolve) => { release = resolve })
    const urls = []
    setup({ request: async ({ method }) => {
        if (method === 'eth_chainId') return '0x7a69'
        if (method === 'eth_accounts') { started(); return accounts }
        throw new Error(method)
    } })
    httpClient.defaults.adapter = async (config) => {
        urls.push(config.url)
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }
    try {
        const pending = initializeAuthenticatedDappSession()
        await accountRequested
        assert.equal(useUserStore.getState().isSessionReady, false)
        assert.deepEqual(urls, [])
        release([address])
        await pending
        assert.deepEqual(urls, ['/api/users/my'])
        assert.equal(useUserStore.getState().isSessionReady, true)
    } finally {
        APP_CONFIG.loginMode = previousMode
        httpClient.defaults.adapter = previousAdapter
        clearAuthSession()
    }
})

test('a changed wallet blocks old authenticated APIs and splash relogs within the same attempt', async () => {
    const previousMode = APP_CONFIG.loginMode
    const previousAdapter = httpClient.defaults.adapter
    APP_CONFIG.loginMode = 'dapp'
    let signatures = 0
    const provider = { request: async ({ method }) => {
        if (method === 'eth_chainId') return '0x7a69'
        if (method === 'eth_accounts') return [otherAddress]
        if (method === 'personal_sign') { signatures += 1; return `0x${'1'.repeat(130)}` }
        throw new Error(method)
    } }
    const urls = []
    httpClient.defaults.adapter = async (config) => {
        urls.push(config.url)
        return { data: { token: 'fresh-token' }, status: 200, statusText: 'OK', headers: {}, config }
    }
    try {
        setup(provider)
        await initializeAuthenticatedDappSession()
        assert.equal(getToken(), '')
        assert.equal(useUserStore.getState().isAuthenticated, false)
        assert.deepEqual(urls, [])
        setup(provider)
        await startAuthFlow()
        assert.equal(signatures, 1)
        assert.equal(getToken(), 'fresh-token')
        assert.equal(useUserStore.getState().isSessionReady, true)
        assert.deepEqual(urls, ['/api/auth/login'])
    } finally {
        APP_CONFIG.loginMode = previousMode
        httpClient.defaults.adapter = previousAdapter
        clearAuthSession()
    }
})

test('account login mode restores without touching an injected provider', async () => {
    const previousMode = APP_CONFIG.loginMode
    const previousAdapter = httpClient.defaults.adapter
    APP_CONFIG.loginMode = 'account'
    setup({ request: async () => { throw new Error('wallet must not be requested') } })
    httpClient.defaults.adapter = async (config) => ({ data: {}, status: 200, statusText: 'OK', headers: {}, config })
    try {
        await initializeAuthenticatedDappSession()
        assert.equal(useUserStore.getState().isSessionReady, true)
        assert.equal(getToken(), 'stored-token')
    } finally {
        APP_CONFIG.loginMode = previousMode
        httpClient.defaults.adapter = previousAdapter
        clearAuthSession()
    }
})

test('hybrid restores account sessions without a wallet but DApp-only startup clears them', async () => {
    const previousMode = APP_CONFIG.loginMode
    const previousAdapter = httpClient.defaults.adapter
    const urls = []
    httpClient.defaults.adapter = async (config) => {
        urls.push(config.url)
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }
    try {
        APP_CONFIG.loginMode = 'hybrid'
        setup(undefined)
        await initializeAuthenticatedDappSession()
        assert.equal(useUserStore.getState().isSessionReady, true)
        assert.equal(getToken(), 'stored-token')
        assert.deepEqual(urls, ['/api/users/my'])
        APP_CONFIG.loginMode = 'dapp'
        setup(undefined)
        urls.length = 0
        await initializeAuthenticatedDappSession()
        assert.equal(getToken(), '')
        assert.equal(useUserStore.getState().isAuthenticated, false)
        assert.deepEqual(urls, [])
    } finally {
        APP_CONFIG.loginMode = previousMode
        httpClient.defaults.adapter = previousAdapter
        clearAuthSession()
    }
})

test('a stale wallet restoration cannot request authenticated APIs for a newer session', async () => {
    const previousMode = APP_CONFIG.loginMode
    const previousAdapter = httpClient.defaults.adapter
    APP_CONFIG.loginMode = 'dapp'
    let release
    let started
    const accountRequested = new Promise((resolve) => { started = resolve })
    const accounts = new Promise((resolve) => { release = resolve })
    const urls = []
    setup({ request: async ({ method }) => {
        if (method === 'eth_chainId') return '0x7a69'
        if (method === 'eth_accounts') { started(); return accounts }
        throw new Error(method)
    } })
    httpClient.defaults.adapter = async (config) => {
        urls.push(config.url)
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }
    try {
        const pending = initializeAuthenticatedDappSession()
        await accountRequested
        completeLogin('new-session')
        release([address])
        await pending
        assert.deepEqual(urls, [])
        assert.equal(getToken(), 'new-session')
        assert.equal(useUserStore.getState().isSessionReady, true)
    } finally {
        APP_CONFIG.loginMode = previousMode
        httpClient.defaults.adapter = previousAdapter
        clearAuthSession()
    }
})
