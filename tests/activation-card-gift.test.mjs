import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h, act } from 'react'
import { initReactI18next } from 'react-i18next'
import { Window } from 'happy-dom'

// React DOM detects native input-event support at import time.
const bootstrapWindow = new Window()
globalThis.window = bootstrapWindow
globalThis.document = bootstrapWindow.document
const { installUiDom, mount, deferred } = await import('./helpers/ui-dom.mjs')
const dom = installUiDom()
after(() => { dom.dispose(); bootstrapWindow.happyDOM.abort() })
const { appI18n } = await import('../src/i18n/instance.ts')
await appI18n.use(initReactI18next).init({ lng: 'zh-Hans', resources: { 'zh-Hans': { translation: {} } }, keySeparator: false })
const { ActivationCardPage } = await import('../src/pages/main/activation-card/ActivationCardPage.tsx')
const { httpClient } = await import('../src/services/http/client.ts')
const { resetDappProviderCache } = await import('../src/services/dapp/provider.ts')
const { setWalletAddress } = await import('../src/services/storage/common.ts')
const { invalidateAuthSession } = await import('../src/features/auth/lifecycle.ts')
const { message } = await import('../src/components/Message/message.ts')

const owner = '0x0000000000000000000000000000000000000001'
const recipient = '0x0000000000000000000000000000000000000002'
const signature = `0x${'ab'.repeat(65)}`

async function setup({ connected = owner, ownedCount = 3 } = {}) {
    const previousAdapter = httpClient.defaults.adapter
    const previousSuccess = message.success
    const requests = [], walletRequests = [], feedback = []
    const signing = deferred()
    resetDappProviderCache()
    setWalletAddress(owner)
    window.ethereum = { async request(args) {
        walletRequests.push(args)
        if (args.method === 'eth_accounts') return [connected]
        if (args.method === 'personal_sign') return signing.promise
        throw new Error(`Unexpected wallet method ${args.method}`)
    } }
    httpClient.defaults.adapter = async (config) => {
        requests.push({ url: config.url, method: config.method, data: config.data ? JSON.parse(config.data) : undefined })
        const data = config.url.endsWith('/gift') ? {} : config.url.endsWith('/logs') ? { list: [
            { id: 1, card_name: '10USDT激活卡', amount: '10', is_inc: 0, num: 1, content: '赠送激活卡', from_address: recipient, created_at: '2026-10-27 17:00:00' },
            { id: 2, card_name: '10USDT激活卡', amount: '10', is_inc: 1, num: 1, content: '获得激活卡', from_address: owner, created_at: '2026-10-27 16:00:00' },
            { id: 3, card_name: '10USDT激活卡', amount: '10', is_inc: 1, num: 1, content: '购买激活卡', from_address: '', created_at: '2026-10-27 15:00:00' },
        ] } : { list: [{ id: 17, name: '10USDT激活卡', amount: '0.01', num: ownedCount }] }
        return { data, status: 200, statusText: 'OK', headers: {}, config }
    }
    message.success = (text) => feedback.push(text)
    const view = await mount(h(ActivationCardPage))
    return { ...view, signing, requests, walletRequests, feedback, async dispose() {
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
        message.success = previousSuccess
        resetDappProviderCache()
        delete window.ethereum
    } }
}

async function submitGift(view, quantity = '1') {
    await act(async () => view.container.querySelector('.activation-card-page__gift').click())
    const input = document.querySelector('input[name="recipient"]')
    await act(async () => {
        Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, recipient)
        input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
        input.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
        const quantityInput = document.querySelector('input[name="quantity"]')
        Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(quantityInput, quantity)
        quantityInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
        quantityInput.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
    })
    await act(async () => document.querySelector('.activation-card-page__gift-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })))
}

test('gifting waits for a Transfer signature and submits its matching timestamp once, then reloads inventory and history', async () => {
    const view = await setup()
    try {
        const before = Math.floor(Date.now() / 1000)
        await submitGift(view)
        assert.equal(view.walletRequests.filter(({ method }) => method === 'personal_sign').length, 1)
        const submit = document.querySelector('.activation-card-page__form-submit')
        assert.equal(submit.disabled, true)
        assert.equal(view.requests.filter(({ url }) => url.endsWith('/gift')).length, 0)
        await act(async () => document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })))
        const signatures = view.walletRequests.filter(({ method }) => method === 'personal_sign')
        assert.equal(signatures.length, 1)
        assert.equal(signatures[0].params[1].toLowerCase(), owner)
        const signedText = Buffer.from(signatures[0].params[0].slice(2), 'hex').toString('utf8')
        assert.match(signedText, /^Transfer-\d+$/)
        const timestamp = Number(signedText.slice('Transfer-'.length))
        assert.ok(timestamp >= before && timestamp <= Math.floor(Date.now() / 1000))
        await act(async () => { view.signing.resolve(signature); await view.signing.promise })
        assert.deepEqual(view.requests.filter(({ url }) => url.endsWith('/gift')), [{
            url: '/api/activation_cards/gift', method: 'post', data: { address: recipient, card_id: 17, num: 1, signature, timestamp },
        }])
        assert.equal(view.requests.filter(({ url }) => url === '/api/activation_cards').length, 2)
        assert.equal(view.requests.filter(({ url }) => url.endsWith('/logs')).length, 2)
        assert.deepEqual(view.feedback, ['转赠成功'])
    } finally { await view.dispose() }
})

test('gift quantities exceeding owned inventory are rejected before signing or submitting', async () => {
    const view = await setup({ ownedCount: 3 })
    try {
        await submitGift(view, '4')
        assert.equal(document.querySelector('[role="alert"]').textContent, '转赠数量不能超过拥有数量')
        assert.equal(view.walletRequests.length, 0)
        assert.equal(view.requests.length, 2)
        assert.deepEqual(view.feedback, [])
    } finally { await view.dispose() }
})

test('rejected signatures preserve the gift form and never send the gift API', async () => {
    const view = await setup()
    try {
        await submitGift(view)
        assert.equal(view.walletRequests.filter(({ method }) => method === 'personal_sign').length, 1)
        await act(async () => {
            view.signing.reject(Object.assign(new Error('User rejected'), { code: 4001 }))
            await view.signing.promise.catch(() => {})
        })
        assert.equal(view.requests.length, 2)
        assert.equal(document.querySelector('input[name="recipient"]').value, recipient)
        assert.equal(document.querySelector('.activation-card-page__form-submit').disabled, false)
        assert.equal(document.querySelector('[role="alert"]').textContent, '签名失败')
        assert.deepEqual(view.feedback, [])
    } finally { await view.dispose() }
})

for (const change of ['unmount', 'session', 'wallet']) {
    test(`a pending gift cannot submit after ${change} changes`, async () => {
        const view = await setup()
        try {
            await submitGift(view)
            assert.equal(view.walletRequests.filter(({ method }) => method === 'personal_sign').length, 1)
            if (change === 'unmount') await view.unmount()
            if (change === 'session') invalidateAuthSession()
            if (change === 'wallet') setWalletAddress(recipient)
            await act(async () => { view.signing.resolve(signature); await view.signing.promise })
            assert.equal(view.requests.length, 2)
            assert.deepEqual(view.feedback, [])
        } finally { await view.dispose() }
    })
}

test('a wallet differing from the signed-in account cannot sign or gift cards', async () => {
    const view = await setup({ connected: recipient })
    try {
        await submitGift(view)
        assert.equal(view.walletRequests.some(({ method }) => method === 'personal_sign'), false)
        assert.equal(view.requests.length, 2)
    } finally { await view.dispose() }
})

test('history shows the full counterparty address for sent and received cards and hides empty addresses', async () => {
    const view = await setup()
    try {
        const records = [...view.container.querySelectorAll('#activation-card-records > li')]
        assert.equal(records.length, 3)
        assert.ok(records[0].textContent.includes(`转赠地址：${recipient}`))
        assert.ok(records[1].textContent.includes(`转赠地址：${owner}`))
        assert.equal(records[2].textContent.includes('转赠地址'), false)
    } finally { await view.dispose() }
})
