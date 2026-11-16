import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'
import { AxiosError } from 'axios'
import { act, createElement as h } from 'react'
import { initReactI18next } from 'react-i18next'
import { MemoryRouter } from 'react-router'

import { deferred, installUiDom, installWindowTimers, mount } from './helpers/ui-dom.mjs'

const dom = installUiDom()
after(() => dom.dispose())

const { appI18n } = await import('../src/i18n/instance.ts')
await appI18n.use(initReactI18next).init({ lng: 'zh-Hans', resources: { 'zh-Hans': { translation: {} } }, keySeparator: false })
const { SplashPage } = await import('../src/pages/splash/SplashPage.tsx')
const { clearAuthSession } = await import('../src/features/auth/session.ts')
const { registerAppRouteReplacer } = await import('../src/router/bridge.ts')
const { resetDappProviderCache } = await import('../src/services/dapp/provider.ts')
const { httpClient } = await import('../src/services/http/client.ts')
const { getToken } = await import('../src/services/storage/token.ts')

const address = '0x0000000000000000000000000000000000000001'
const signature = `0x${'ab'.repeat(65)}`

async function mountSplash(request, respond = (config) => ({
    data: { token: 'login-token' }, status: 200, statusText: 'OK', headers: {}, config,
})) {
    clearAuthSession()
    resetDappProviderCache()
    window.ethereum = { request }
    const timers = installWindowTimers(window)
    const routes = []
    const urls = []
    const unregister = registerAppRouteReplacer((path) => routes.push(path))
    const previousAdapter = httpClient.defaults.adapter
    httpClient.defaults.adapter = async (config) => {
        urls.push(config.url)
        return respond(config)
    }
    const view = await mount(h(MemoryRouter, null, h(SplashPage)))
    return {
        ...view, timers, routes, urls,
        async dispose() {
            await view.unmount()
            timers.restore()
            unregister()
            httpClient.defaults.adapter = previousAdapter
            clearAuthSession()
            resetDappProviderCache()
            delete window.ethereum
        },
    }
}

test('splash signs in when TP authorizes even if a chain query after authorization would hang', async () => {
    let authorized = false
    const view = await mountSplash(async ({ method }) => {
        if (method === 'eth_chainId') return authorized ? new Promise(() => {}) : '0x38'
        if (method === 'eth_accounts') return authorized ? [address] : []
        if (method === 'eth_requestAccounts') {
            authorized = true
            return [address]
        }
        if (method === 'personal_sign') return signature
        throw new Error(method)
    })
    try {
        await view.timers.flush()
        await act(async () => { await setImmediate() })
        assert.equal(authorized, true)
        assert.deepEqual(view.urls, ['/api/auth/login'])
        assert.deepEqual(view.routes, ['/home'])
        assert.equal(getToken(), 'login-token')
    } finally {
        await view.dispose()
    }
})

test('splash reads the authorized address after a wallet confirms connection without returning accounts', async () => {
    let authorized = false
    let authorizationCount = 0
    const view = await mountSplash(async ({ method, params }) => {
        if (method === 'eth_chainId') return '0x38'
        if (method === 'eth_accounts') return authorized ? [address] : []
        if (method === 'eth_requestAccounts') {
            authorizationCount += 1
            authorized = true
            return []
        }
        if (method === 'personal_sign') {
            assert.equal(params[1], address)
            return signature
        }
        throw new Error(method)
    })
    try {
        await view.timers.flush()
        await act(async () => { await setImmediate() })
        assert.equal(authorizationCount, 1)
        assert.deepEqual(view.urls, ['/api/auth/login'])
        assert.deepEqual(view.routes, ['/home'])
        assert.equal(getToken(), 'login-token')
    } finally {
        await view.dispose()
    }
})

test('splash lets users retry a hung authorization and a rejected signature, ignoring a late authorization', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const firstAuthorization = deferred()
    const authorizationStarted = deferred()
    let authorizationCount = 0
    let signCount = 0
    const view = await mountSplash(async ({ method }) => {
        if (method === 'eth_chainId') return '0x38'
        if (method === 'eth_accounts') return authorizationCount < 2 ? [] : [address]
        if (method === 'eth_requestAccounts') {
            if (++authorizationCount === 1) {
                authorizationStarted.resolve()
                return firstAuthorization.promise
            }
            return [address]
        }
        if (method === 'personal_sign') {
            if (++signCount === 1) throw Object.assign(new Error('User rejected the request'), { code: 4001 })
            return signature
        }
        throw new Error(method)
    })
    try {
        const status = () => view.container.querySelector('[role="status"]').textContent
        const retry = async () => {
            const button = view.container.querySelector('button')
            assert.equal(button.textContent, '点击重试')
            await act(async () => button.click())
            await view.timers.flush()
            await act(async () => { await setImmediate() })
        }

        await view.timers.flush()
        await authorizationStarted.promise
        await act(async () => t.mock.timers.tick(45_000))
        assert.equal(status(), '钱包连接 · 请求超时 (AUTH-03)')
        assert.deepEqual(view.urls, [])

        await retry()
        assert.equal(status(), '登录签名 · 已拒绝登录签名 (AUTH-04)')
        assert.deepEqual(view.urls, [])

        await retry()
        await act(async () => { firstAuthorization.resolve([address]); await setImmediate() })
        assert.equal(signCount, 2)
        assert.deepEqual(view.urls, ['/api/auth/login'])
        assert.deepEqual(view.routes, ['/home'])
        assert.equal(getToken(), 'login-token')
        assert.equal(view.container.querySelector('button'), null)
    } finally {
        await view.dispose()
    }
})

test('splash keeps the login API rejection visible and lets the user retry', async () => {
    const rejection = '请使用有效邀请码'
    const view = await mountSplash(async ({ method }) => {
        if (method === 'eth_chainId') return '0x38'
        if (method === 'eth_accounts') return [address]
        if (method === 'personal_sign') return signature
        throw new Error(method)
    }, (config) => {
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
            data: rejection, status: 401, statusText: 'Unauthorized', headers: {}, config,
        })
    })
    try {
        await view.timers.flush()
        await act(async () => { await setImmediate() })
        assert.equal(view.container.querySelector('[role="status"]').textContent, `登录接口 · ${rejection} (AUTH-05 / HTTP 401)`)
        assert.equal(view.container.querySelector('button').textContent, '点击重试')
        assert.deepEqual(view.urls, ['/api/auth/login'])
        assert.deepEqual(view.routes, [])
        assert.equal(getToken(), '')
    } finally {
        await view.dispose()
    }
})

test('splash distinguishes a wallet detection failure from a wallet network failure', async () => {
    const view = await mountSplash(async () => { throw new Error('Chain ID unavailable') })
    try {
        // An injected object without a request method is an unavailable provider.
        const wallet = window.ethereum
        window.ethereum = {}
        await view.timers.flush()
        await act(async () => { await setImmediate() })
        const status = () => view.container.querySelector('[role="status"]').textContent
        assert.equal(status(), '钱包检测 · 请使用钱包环境打开！ (AUTH-01)')

        window.ethereum = wallet
        await act(async () => view.container.querySelector('button').click())
        await view.timers.flush()
        await act(async () => { await setImmediate() })
        assert.equal(status(), '钱包网络 · 钱包网络检查失败 (AUTH-02)')
        assert.deepEqual(view.urls, [])
    } finally {
        await view.dispose()
    }
})
