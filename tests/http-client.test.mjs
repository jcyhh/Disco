import test from 'node:test'
import assert from 'node:assert/strict'
import axios, { AxiosError } from 'axios'

import { message } from '../src/components/Message/message.ts'
import { APP_CONFIG } from '../src/config/app.ts'
import { getRequestLanguage } from '../src/i18n/getRequestLanguage.ts'
import { httpClient } from '../src/services/http/client.ts'
import { HttpError } from '../src/services/http/error.ts'
import { completeLogin, clearAuthSession } from '../src/features/auth/session.ts'
import { getToken } from '../src/services/storage/token.ts'

function createStorage(token = '') {
    const cache = new Map(token ? [['TOKEN', token]] : [])
    return {
        getItem: (key) => cache.get(key) ?? null,
        setItem: (key, value) => cache.set(key, value),
        removeItem: (key) => cache.delete(key),
    }
}

test('static page mode silently cancels requests before transport and normal mode restores it', async () => {
    const previousStaticPageMode = APP_CONFIG.enableStaticPageMode
    const previousWindow = globalThis.window
    const previousWarning = message.warning
    const storage = createStorage('static-session')
    const warnings = []
    let adapterCalls = 0
    const adapter = async (config) => {
        adapterCalls += 1
        return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
    }

    APP_CONFIG.enableStaticPageMode = true
    globalThis.window = { localStorage: storage }
    message.warning = (content) => { warnings.push(content) }

    try {
        for (const config of [
            { method: 'GET', url: '/api/users/my' },
            { method: 'POST', url: '/api/uploads', data: { value: 1 } },
        ]) {
            await assert.rejects(httpClient.request({ ...config, adapter }), (error) => {
                assert.ok(error instanceof HttpError)
                assert.equal(error.code, AxiosError.ERR_CANCELED)
                assert.equal(axios.isCancel(error.cause), true)
                return true
            })
        }

        assert.equal(adapterCalls, 0)
        assert.equal(getToken(), 'static-session')
        assert.deepEqual(warnings, [])

        APP_CONFIG.enableStaticPageMode = false
        const response = await httpClient.get('/api/users/my', { adapter })

        assert.equal(adapterCalls, 1)
        assert.deepEqual(response.data, { ok: true })
        assert.equal(response.config.headers.get('Authorization'), 'Bearer static-session')
    } finally {
        APP_CONFIG.enableStaticPageMode = previousStaticPageMode
        globalThis.window = previousWindow
        message.warning = previousWarning
    }
})

test('only sends Address in a DApp wallet host', async () => {
    const storage = createStorage('token-value')
    storage.setItem('LANG', 'zh-Hant')
    storage.setItem('WALLET_ADDRESS', '0x0000000000000000000000000000000000000001')
    globalThis.window = { localStorage: storage }
    let captured

    await httpClient.request({
        url: '/example',
        method: 'POST',
        data: { value: 1 },
        adapter: async (config) => {
            captured = config
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
        },
    })

    assert.equal(captured.headers.get('Authorization'), 'Bearer token-value')
    assert.equal(captured.headers.has('Address'), false)
    assert.equal(captured.headers.get('lang'), APP_CONFIG.enableI18n ? getRequestLanguage() : undefined)
    assert.equal(
        captured.headers.getContentType(),
        'application/json; charset=UTF-8',
    )
})

test('keeps the token header even when local token storage is empty', async () => {
    globalThis.window = { localStorage: createStorage() }
    let captured

    await httpClient.request({
        url: '/example',
        adapter: async (config) => {
            captured = config
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
        },
    })

    assert.equal(captured.headers.has('Authorization'), true)
    assert.match(captured.headers.get('Authorization') ?? '', /^Bearer/)
})

test('does not send lang when i18n is disabled', async () => {
    const previousEnableI18n = APP_CONFIG.enableI18n
    APP_CONFIG.enableI18n = false

    try {
        globalThis.window = { localStorage: createStorage('token-value') }
        let captured

        await httpClient.request({
            url: '/example',
            adapter: async (config) => {
                captured = config
                return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
            },
        })

        assert.equal(captured.headers.has('lang'), false)
    } finally {
        APP_CONFIG.enableI18n = previousEnableI18n
    }
})

test('uses the cached wallet address in a DApp wallet host', async () => {
    const storage = createStorage('token-value')
    storage.setItem('WALLET_ADDRESS', '0x0000000000000000000000000000000000000001')
    globalThis.window = {
        ethereum: { request: async () => [] },
        localStorage: storage,
    }
    let captured

    await httpClient.request({
        url: '/example',
        adapter: async (config) => {
            captured = config
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
        },
    })

    assert.equal(captured.headers.get('Address'), '0x0000000000000000000000000000000000000001')
})

test('uses the cached wallet address in a Flutter host with an injected wallet', async () => {
    const storage = createStorage('token-value')
    storage.setItem('WALLET_ADDRESS', '0x0000000000000000000000000000000000000001')
    globalThis.window = {
        __FROM_FLUTTER__: true,
        ethereum: { request: async () => [] },
        localStorage: storage,
    }
    let captured

    await httpClient.request({
        url: '/example',
        adapter: async (config) => {
            captured = config
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
        },
    })

    assert.equal(captured.headers.get('Address'), '0x0000000000000000000000000000000000000001')
})

test('normalizes 401 and removes the cached token', async () => {
    const storage = createStorage('expired')
    globalThis.window = { localStorage: storage }

    const request = httpClient.request({
        url: '/private',
        adapter: async (config) => {
            const response = {
                data: { message: '登录已失效' },
                status: 401,
                statusText: 'Unauthorized',
                headers: {},
                config,
            }
            throw new AxiosError(
                'Request failed',
                'ERR_BAD_REQUEST',
                config,
                undefined,
                response,
            )
        },
    })

    await assert.rejects(request, (error) => {
        assert.ok(error instanceof HttpError)
        assert.equal(error.status, 401)
        return true
    })
    assert.equal(storage.getItem('TOKEN'), null)
})

for (const nextToken of ['new-session', 'same-session-token']) {
    test(`a late 401 cannot clear a newer login (${nextToken})`, async () => {
        globalThis.window = { localStorage: createStorage() }
        completeLogin('same-session-token')
        let release
        let started
        const ready = new Promise((resolve) => { started = resolve })
        const responseReady = new Promise((resolve) => { release = resolve })
        const pending = httpClient.request({
            url: '/private',
            adapter: async (config) => {
                started()
                await responseReady
                throw new AxiosError('Expired', 'ERR_BAD_REQUEST', config, undefined, {
                    data: {}, status: 401, statusText: 'Unauthorized', headers: {}, config,
                })
            },
        })
        await ready
        completeLogin(nextToken)
        release()
        await assert.rejects(pending, (error) => error.status === 401)
        assert.equal(getToken(), nextToken)
        clearAuthSession()
    })
}
