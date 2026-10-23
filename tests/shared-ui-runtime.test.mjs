import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h, act, useCallback } from 'react'
import { initReactI18next } from 'react-i18next'

import { installUiDom, mount, deferred, installWindowTimers } from './helpers/ui-dom.mjs'

const dom = installUiDom()
after(() => dom.dispose())
const { appI18n } = await import('../src/i18n/instance.ts')
await appI18n.use(initReactI18next).init({ lng: 'en', resources: { en: { translation: { 提示: 'Notice', 确认: 'Confirm', 标题: 'Title', 暂无数据: 'No data', 请选择: 'Choose', 确定: 'OK' } } }, keySeparator: false })
const { SegmentedTabs } = await import('../src/components/SegmentedTabs/SegmentedTabs.tsx')
const { ProgressBar } = await import('../src/components/ProgressBar/ProgressBar.tsx')
const { InfiniteScroll } = await import('../src/components/InfiniteScroll/InfiniteScroll.tsx')
const { ConfirmPopup } = await import('../src/components/ConfirmPopup/ConfirmPopup.tsx')
const { Popup } = await import('../src/components/Popup/Popup.tsx')
const { Picker } = await import('../src/components/Picker/Picker.tsx')
const { CountdownTimer } = await import('../src/components/CountdownTimer/CountdownTimer.tsx')
const { calculateCountdownParts } = await import('../src/shared/time/calculateCountdownParts.ts')
const { PagePullRefresh, usePageRefresh } = await import('../src/components/PagePullRefresh/index.ts')
await import('../src/components/Message/Message.tsx')
const { message } = await import('../src/components/Message/message.ts')

function click(element) { element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })) }

function touch(element, type, clientY) {
    const event = new dom.window.Event(type, { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : [{ clientY }] })
    element.dispatchEvent(event)
}

async function pull(container) {
    const element = container.querySelector('.page-pull-refresh')
    await act(async () => { touch(element, 'touchstart', 10); touch(element, 'touchmove', 240); touch(element, 'touchend', 240) })
}

test('tabs are controlled, support five options and keyboard navigation skips disabled choices', async () => {
    const values = []
    const options = ['a', 'b', 'c', 'd', 'e'].map((value) => ({ value, label: value, disabled: value === 'b' }))
    const view = await mount(h(SegmentedTabs, { options, value: 'a', onChange: (value) => values.push(value) }))
    try {
        const buttons = view.container.querySelectorAll('button')
        await act(async () => click(buttons[2]))
        assert.deepEqual(values, ['c'])
        assert.equal(buttons[0].getAttribute('aria-selected'), 'true', 'parent retains selected state until it updates value')
        await act(async () => buttons[0].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })))
        assert.equal(values.at(-1), 'c')
        assert.equal(document.activeElement, buttons[2])
        await view.render(h(SegmentedTabs, { options, value: 'missing', onChange: () => {} }))
        assert.equal(view.container.querySelector('.segmented-tabs__indicator'), null)
        assert.equal(view.container.querySelector('[aria-selected="true"]'), null)
    } finally { await view.unmount() }
})

test('progress exposes bounded calculated progress through the native element', async () => {
    const view = await mount(h(ProgressBar, { currentValue: '3', totalValue: '5', 'aria-label': 'Progress' }))
    try {
        const progress = view.container.querySelector('progress')
        assert.equal(progress.value, 60)
        assert.equal(progress.max, 100)
        await view.render(h(ProgressBar, { currentValue: '20', totalValue: '5' }))
        assert.equal(progress.value, 100)
        assert.equal(progress.hasAttribute('style'), false)
    } finally { await view.unmount() }
})

test('infinite scroll guards concurrent events, recovers rejected and thrown loads, and ignores late unmount failures', async () => {
    const observers = []
    const previous = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = class {
        constructor(callback) { this.callback = callback; observers.push(this) }
        observe() {}
        disconnect() { this.disconnected = true }
        emit() { this.callback([{ isIntersecting: true }]) }
    }
    const first = deferred(), late = deferred()
    const errors = []
    let calls = 0
    const view = await mount(h(InfiniteScroll, {
        loading: false, hasMore: true, onError: (error) => errors.push(error),
        onLoadMore: () => { calls++; if (calls === 1) return first.promise; if (calls === 2) throw new Error('sync'); return late.promise },
    }, 'List'))
    try {
        const observer = observers.at(-1)
        await act(async () => { observer.emit(); observer.emit() })
        assert.equal(calls, 1)
        await act(async () => first.reject(new Error('async')))
        assert.equal(errors.length, 1)
        await act(async () => observer.emit())
        assert.equal(calls, 2)
        assert.equal(errors.length, 2)
        await act(async () => observer.emit())
        assert.equal(calls, 3)
        await view.unmount()
        await act(async () => late.reject(new Error('late')))
        assert.equal(errors.length, 2)
        assert.equal(observer.disconnected, true)
    } finally { globalThis.IntersectionObserver = previous; if (view.container.isConnected) await view.unmount() }
})

test('confirmation uses common translations and suppresses all actions while submitting', async () => {
    let confirms = 0, closes = 0
    const props = { show: true, message: 'Preview', onConfirm: () => confirms++, onClose: () => closes++, contentTheme: 'gradient-card' }
    const view = await mount(h(ConfirmPopup, props))
    try {
        assert.ok(document.querySelector('.popup-content--gradient-card'))
        assert.equal(document.querySelector('[role="dialog"]').getAttribute('aria-label'), 'Notice')
        await act(async () => click([...document.querySelectorAll('.popup button')].find((button) => button.textContent === 'Confirm')))
        assert.equal(confirms, 1)
        await view.render(h(ConfirmPopup, { ...props, submitting: true }))
        const confirm = [...document.querySelectorAll('.popup button')].find((button) => button.textContent === 'Confirm')
        assert.equal(confirm.disabled, true)
        assert.equal(document.querySelector('[aria-label="Close dialog"]'), null)
        await act(async () => { click(confirm); click(document.querySelector('.popup__backdrop__overlay')) })
        assert.equal(confirms, 1)
        assert.equal(closes, 0)
    } finally { await view.unmount() }
})

test('countdown calculates absolute elapsed time across DST and clamps invalid or expired timestamps', async () => {
    const parts = calculateCountdownParts({ now: '2026-03-08T06:30:00Z', targetTime: '2026-03-08T07:30:00Z' })
    assert.deepEqual(parts, { days: '00', hours: '01', minutes: '00', seconds: '00' })
    for (const targetTime of ['bad', '2020-01-01T00:00:00Z', undefined]) {
        assert.deepEqual(calculateCountdownParts({ targetTime, now: '2026-01-01T00:00:00Z' }), { days: '00', hours: '00', minutes: '00', seconds: '00' })
    }
    const view = await mount(h(CountdownTimer, { targetTime: 90000, now: 0 }))
    try {
        assert.deepEqual([...view.container.querySelectorAll('.app-countdown-timer__unit')].map((element) => element.textContent), ['01', '30'])
        await view.render(h(CountdownTimer, { targetTime: 90000, now: 90000 }))
        assert.deepEqual([...view.container.querySelectorAll('.app-countdown-timer__unit')].map((element) => element.textContent), ['00', '00'])
    } finally { await view.unmount() }
})

test('toast replaces prior content safely, cancels obsolete timers, then removes its root', async () => {
    const timers = installWindowTimers(dom.window)
    try {
        await act(async () => { message.warning('First'); await Promise.resolve() })
        assert.equal(document.querySelector('.message-toast__text').textContent, 'First')
        await act(async () => { message({ message: '<img src=x onerror=alert(1)>', type: 'success', duration: 0 }); await Promise.resolve() })
        assert.equal(document.querySelectorAll('.message-toast-root').length, 1)
        assert.equal(document.querySelector('.message-toast__text').querySelector('img'), null)
        assert.ok(document.querySelector('.message-toast__icon'))
        assert.equal(document.querySelector('.message-toast__text').textContent, '<img src=x onerror=alert(1)>')
        assert.equal(timers.pending.size, 0)
        await act(async () => message.close())
        await timers.flush()
        assert.equal(document.querySelector('.message-toast-root'), null)
    } finally { timers.restore() }
})

test('pull refresh awaits real work, settles a rejection, and permits retry', async () => {
    const timers = installWindowTimers(dom.window)
    const pending = deferred()
    const errors = []
    let calls = 0
    function Page() {
        const refresh = useCallback(() => { calls++; return calls === 1 ? pending.promise : Promise.resolve() }, [])
        usePageRefresh(refresh)
        return h('p', null, 'Page')
    }
    const view = await mount(h(PagePullRefresh, { onError: (error) => errors.push(error) }, h(Page)))
    try {
        await pull(view.container)
        assert.equal(calls, 1)
        assert.ok(view.container.querySelector('.page-pull-refresh--refreshing'))
        await pull(view.container)
        assert.equal(calls, 1)
        await act(async () => pending.reject(new Error('refresh failed')))
        await timers.flush()
        assert.equal(errors.length, 1)
        assert.ok(view.container.querySelector('.page-pull-refresh--idle'))
        await pull(view.container)
        await timers.flush()
        assert.equal(calls, 2)
    } finally { await view.unmount(); timers.restore() }
})

test('portal dialog gestures do not refresh or cancel scrolling, while page gestures still refresh', async () => {
    const timers = installWindowTimers(dom.window)
    let calls = 0
    function Page({ show }) {
        usePageRefresh(useCallback(async () => { calls++ }, []))
        return h(Popup, { show, title: 'Announcement' }, h('div', { className: 'scroll-y' }, 'Long announcement'))
    }
    const render = (show) => h(PagePullRefresh, null, h(Page, { show }))
    const view = await mount(render(true))
    try {
        const content = document.querySelector('[role="dialog"] .scroll-y')
        let wasCancelled
        await act(async () => {
            touch(content, 'touchstart', 10)
            const move = new dom.window.Event('touchmove', { bubbles: true, cancelable: true })
            Object.defineProperty(move, 'touches', { value: [{ clientY: 240 }] })
            content.dispatchEvent(move)
            wasCancelled = move.defaultPrevented
            touch(content, 'touchend', 240)
        })
        assert.equal(calls, 0)
        assert.equal(wasCancelled, false)
        await view.render(render(false))
        await act(async () => document.querySelector('[role="dialog"]').dispatchEvent(new dom.window.Event('animationend', { bubbles: true })))
        await pull(view.container)
        await timers.flush()
        assert.equal(calls, 1)
    } finally { await view.unmount(); timers.restore() }
})

test('unmount invalidates pending refresh without a new timer or late error callback', async () => {
    const timers = installWindowTimers(dom.window)
    const pending = deferred()
    let errors = 0
    function Page() { usePageRefresh(() => pending.promise); return null }
    const view = await mount(h(PagePullRefresh, { onError: () => errors++ }, h(Page)))
    try {
        await pull(view.container)
        await view.unmount()
        await act(async () => pending.reject(new Error('late')))
        assert.equal(errors, 0)
        assert.equal(timers.pending.size, 0)
    } finally { timers.restore(); if (view.container.isConnected) await view.unmount() }
})

test('countdown releases its live interval when controlled or unmounted', async () => {
    const previousSet = dom.window.setInterval, previousClear = dom.window.clearInterval
    let starts = 0, clears = 0
    dom.window.setInterval = () => ++starts
    dom.window.clearInterval = () => { clears++ }
    const view = await mount(h(CountdownTimer, { targetTime: Date.now() + 60000 }))
    try {
        assert.equal(starts, 1)
        await view.render(h(CountdownTimer, { targetTime: 60000, now: 0 }))
        assert.equal(clears, 1)
        await view.render(h(CountdownTimer, { targetTime: Date.now() + 60000 }))
        assert.equal(starts, 2)
        await view.unmount()
        assert.equal(clears, 2)
    } finally {
        dom.window.setInterval = previousSet
        dom.window.clearInterval = previousClear
        if (view.container.isConnected) await view.unmount()
    }
})

test('page registration replacement invalidates old refresh while the new page keeps its pending state', async () => {
    const timers = installWindowTimers(dom.window)
    const oldWork = deferred(), newWork = deferred()
    let errors = 0
    const oldLoad = () => oldWork.promise, newLoad = () => newWork.promise
    function Page({ load }) { usePageRefresh(load); return null }
    const render = (load) => h(PagePullRefresh, { onError: () => errors++ }, h(Page, { load }))
    const view = await mount(render(oldLoad))
    try {
        await pull(view.container)
        await view.render(render(newLoad))
        await timers.flush()
        await pull(view.container)
        await act(async () => oldWork.reject(new Error('previous page')))
        assert.equal(errors, 0)
        assert.ok(view.container.querySelector('.page-pull-refresh--refreshing'))
        await act(async () => newWork.resolve())
        await timers.flush()
        assert.ok(view.container.querySelector('.page-pull-refresh--idle'))
    } finally { await view.unmount(); timers.restore() }
})

test('message service is safe before browser document creation', () => {
    const document = globalThis.document
    try {
        delete globalThis.document
        assert.doesNotThrow(() => message.warning('Server-side noop'))
        assert.doesNotThrow(() => message.close())
    } finally { globalThis.document = document }
    assert.equal(document.querySelector('.message-toast-root'), null)
})


test('empty picker uses common translations, shared no-data copy, and disables confirmation', async () => {
    const view = await mount(h(Picker, { show: true, options: [], onClose: () => {} }))
    try {
        assert.equal(document.querySelector('.picker__title').textContent, 'Choose')
        assert.equal(document.querySelector('.empty__text').textContent, 'No data')
        assert.equal(document.querySelector('.picker__confirm').textContent, 'OK')
        assert.equal(document.querySelector('.picker__confirm').disabled, true)
    } finally { await view.unmount() }
})
