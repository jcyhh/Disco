import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { createElement as h, act } from 'react'
import { initReactI18next } from 'react-i18next'
import { installUiDom, mount, deferred } from './helpers/ui-dom.mjs'

const dom = installUiDom()
const contractStub = `data:text/javascript;base64,${Buffer.from(`
let action;
export function setPurchaseAction(next) { action = next }
export function buyActivationCardsWithWallet(...args) { return action(...args) }
`).toString('base64')}`
const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        return nextResolve(specifier === '@/services/contracts/disco.ts' ? contractStub : specifier, context)
    },
})
after(() => { hooks.deregister(); dom.dispose() })
const { appI18n } = await import('../src/i18n/instance.ts')
await appI18n.use(initReactI18next).init({ lng: 'zh-Hans', resources: { 'zh-Hans': { translation: {} } }, keySeparator: false })
const { PurchaseCardPage } = await import('../src/pages/main/purchase-card/PurchaseCardPage.tsx')
const { parsePurchaseQuantity } = await import('../src/pages/main/purchase-card/purchase.ts')
const { httpClient } = await import('../src/services/http/client.ts')
const { message } = await import('../src/components/Message/message.ts')
const { setPurchaseAction } = await import(contractStub)

const cards = [
    { id: 17, name: 'Card A', amount: '0.1', num: 0 },
    { id: 29, name: 'Card B', amount: '20', num: 0 },
]
function click(element) { element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })) }

async function setup() {
    const previousAdapter = httpClient.defaults.adapter
    const previousSuccess = message.success, previousWarning = message.warning
    const requests = [], calls = [], feedback = []
    httpClient.defaults.adapter = async (config) => {
        requests.push(config.url)
        assert.ok(['/api/activation_cards', '/api/users/my'].includes(config.url))
        const data = config.url === '/api/activation_cards' ? { list: cards } : { id: 1, usdt_balance: '0' }
        return { data, status: 200, statusText: 'OK', headers: {}, config }
    }
    message.success = (text) => feedback.push(text)
    message.warning = (text) => feedback.push(text)
    const work = deferred()
    setPurchaseAction((...args) => { calls.push(args); return work.promise })
    const view = await mount(h(PurchaseCardPage))
    return { ...view, calls, requests, feedback, work, async dispose() {
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
        message.success = previousSuccess; message.warning = previousWarning
    } }
}

test('the current quantity parser rejects invalid or unsafe positive whole counts', () => {
    assert.equal(parsePurchaseQuantity('1'), 1)
    assert.equal(parsePurchaseQuantity('0002'), 2)
    for (const value of ['', ' ', '0', '-1', '+1', '1.5', '1e2', 'Infinity', '1a', ' 2', String(Number.MAX_SAFE_INTEGER + 1)]) {
        assert.equal(parsePurchaseQuantity(value), null, value)
    }
})

test('the real purchase page computes exact totals and submits only after confirmation, then refreshes once', async () => {
    const view = await setup()
    try {
        await act(async () => click(view.container.querySelector('.purchase-card-page__plus')))
        await act(async () => click(view.container.querySelector('.purchase-card-page__plus')))
        assert.equal(view.container.querySelector('#purchase-card-quantity').value, '3')
        assert.equal(view.container.querySelector('[aria-live="polite"]').textContent, '0.3 USDT')
        assert.equal(view.calls.length, 0)
        await act(async () => click(view.container.querySelector('[type="submit"]')))
        assert.equal(view.calls.length, 0)
        const confirm = document.querySelector('.confirm-popup button[type="button"]:not(.popup-content__close)')
        await act(async () => { click(confirm); click(confirm) })
        assert.equal(view.calls.length, 1)
        assert.deepEqual(view.calls[0].slice(0, 3), [17, 3, '0.3'])
        assert.ok(view.calls[0][3] instanceof AbortSignal)
        assert.equal(confirm.disabled, true)
        await act(async () => { view.work.resolve(); await view.work.promise })
        assert.deepEqual(view.requests, ['/api/activation_cards', '/api/users/my', '/api/activation_cards', '/api/users/my'])
        assert.ok(view.feedback.includes('购买成功'))
    } finally { await view.dispose() }
})

test('changing the actual card changes the submitted ID and a failure preserves the form for explicit retry', async () => {
    const view = await setup()
    try {
        await act(async () => view.container.querySelectorAll('[type="radio"]')[1].click())
        assert.equal(view.container.querySelector('[aria-live="polite"]').textContent, '20 USDT')
        await act(async () => click(view.container.querySelector('[type="submit"]')))
        const confirm = document.querySelector('.confirm-popup button[type="button"]:not(.popup-content__close)')
        await act(async () => click(confirm))
        assert.deepEqual(view.calls[0].slice(0, 3), [29, 1, '20'])
        await act(async () => { view.work.reject(new Error('Wallet rejected')); await view.work.promise.catch(() => {}) })
        assert.equal(confirm.disabled, false)
        assert.equal(view.requests.length, 2, 'failed writes must not refresh or report success')
        assert.equal(view.feedback.includes('购买成功'), false)
        assert.equal(view.container.querySelector('#purchase-card-quantity').value, '1')
        assert.equal(view.container.querySelectorAll('[type="radio"]')[1].checked, true)
        assert.ok(document.querySelector('[role="dialog"]'))
        setPurchaseAction((...args) => { view.calls.push(args); return Promise.resolve() })
        await act(async () => click(confirm))
        assert.equal(view.calls.length, 2)
        assert.ok(view.feedback.includes('购买成功'))
    } finally { await view.dispose() }
})
