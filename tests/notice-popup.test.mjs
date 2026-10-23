import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h, act } from 'react'
import { initReactI18next } from 'react-i18next'

import { installUiDom, mount, deferred } from './helpers/ui-dom.mjs'

const dom = installUiDom()
after(() => dom.dispose())
const { appI18n } = await import('../src/i18n/instance.ts')
await appI18n.use(initReactI18next).init({ lng: 'zh-Hans', resources: { 'zh-Hans': { translation: {} } }, keySeparator: false })
const { HomeNoticePopup } = await import('../src/features/notice/HomeNoticePopup.tsx')
const { httpClient } = await import('../src/services/http/client.ts')
const result = { is_show: true, notice: { id: 12, title: '公告标题', content: '<p>公告正文</p>', updated_at: '2026-10-23 10:00' } }

test('acknowledging a popup marks it read once and closes only after the request succeeds', async () => {
    const previousAdapter = httpClient.defaults.adapter
    const work = deferred()
    const requests = []
    httpClient.defaults.adapter = async (config) => {
        requests.push(config)
        await work.promise
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }
    const view = await mount(h(HomeNoticePopup, { result }))
    try {
        const dialog = document.querySelector('[role="dialog"]')
        assert.ok(dialog)
        assert.ok(dialog.textContent.includes(result.notice.title))
        assert.ok(dialog.textContent.includes('公告正文'))
        assert.equal(dialog.querySelector('.home-notice-popup__details'), null)
        assert.equal(dialog.querySelector('a'), null)
        const dismiss = dialog.querySelector('.home-notice-popup__dismiss')
        assert.equal(dismiss.textContent, '知道了')
        await act(async () => {
            dismiss.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
            dismiss.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
        })
        assert.equal(requests.length, 1)
        assert.equal(requests[0].url, '/api/notices/12/read')
        assert.equal(dismiss.disabled, true)
        assert.ok(document.querySelector('[role="dialog"]'))
        await act(async () => { work.resolve(); await work.promise })
        await act(async () => dialog.dispatchEvent(new dom.window.Event('animationend', { bubbles: true })))
        assert.equal(Boolean(document.querySelector('[role="dialog"]')), false)
    } finally {
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})

test('a popup request completing after unmount is aborted', async () => {
    const previousAdapter = httpClient.defaults.adapter
    const work = deferred()
    let signal
    httpClient.defaults.adapter = async (config) => {
        signal = config.signal
        await work.promise
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }
    const view = await mount(h(HomeNoticePopup, { result }))
    try {
        await act(async () => document.querySelector('.home-notice-popup__dismiss').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
        await view.unmount()
        assert.equal(signal.aborted, true)
        await act(async () => { work.resolve(); await work.promise })
        assert.equal(Boolean(document.querySelector('[role="dialog"]')), false)
    } finally {
        if (view.container.isConnected) await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})
