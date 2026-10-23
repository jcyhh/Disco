import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h, StrictMode, act } from 'react'
import { installUiDom, mount } from './helpers/ui-dom.mjs'

const dom = installUiDom()
after(() => dom.dispose())
const { usePageReveal } = await import('../src/hooks/usePageReveal.ts')

function setup({ reduced = false, supported = true } = {}) {
    const previousObserver = globalThis.IntersectionObserver
    const previousMatchMedia = dom.window.matchMedia
    const observers = []
    dom.window.matchMedia = () => ({ matches: reduced })
    globalThis.IntersectionObserver = supported ? class {
        observed = new Set()
        constructor(callback) { this.callback = callback; observers.push(this) }
        observe(element) { this.observed.add(element) }
        unobserve(element) { this.observed.delete(element) }
        disconnect() { this.disconnected = true; this.observed.clear() }
        emit(element) { this.callback([{ target: element, isIntersecting: true }]) }
    } : undefined
    return { observers, restore() {
        globalThis.IntersectionObserver = previousObserver
        dom.window.matchMedia = previousMatchMedia
    } }
}

function Page({ count = 1, text = 'Content' }) {
    const ref = usePageReveal()
    return h('section', { ref }, Array.from({ length: count }, (_, i) => h('article', { key: i, 'data-reveal': 'rise', 'data-id': i }, h('button', null, `${text} ${i}`))))
}
const flushMutations = () => new Promise((resolve) => setImmediate(resolve))

test('reveal handles StrictMode, async inserts, focus, removal and cleanup without replaying existing items', async () => {
    const state = setup()
    const render = (props) => h(StrictMode, null, h(Page, props))
    const view = await mount(render({ count: 1 }))
    try {
        const observer = state.observers.at(-1)
        const first = view.container.querySelector('article')
        assert.equal(first.classList.contains('page-reveal--waiting'), true)
        observer.emit(first)
        assert.equal(first.classList.contains('page-reveal--visible'), true)
        assert.equal(observer.observed.has(first), false)
        const oldObserver = state.observers[0]
        if (oldObserver !== observer) {
            assert.equal(oldObserver.disconnected, true)
            oldObserver.emit(first)
        }
        await view.render(render({ count: 2, text: 'Updated' }))
        await flushMutations()
        assert.equal(observer.observed.has(first), false, 'data updates cannot re-register an existing card')
        const second = view.container.querySelector('[data-id="1"]')
        assert.equal(observer.observed.has(second), true)
        assert.equal(second.classList.contains('page-reveal--waiting'), true)
        await act(async () => second.querySelector('button').focus())
        assert.equal(second.classList.contains('page-reveal--waiting'), false)
        assert.equal(second.classList.contains('page-reveal--immediate'), true)
        assert.equal(observer.observed.has(second), false)
        await view.render(render({ count: 1 }))
        await flushMutations()
        assert.equal(observer.observed.has(second), false)
        await view.unmount()
        assert.equal(observer.disconnected, true)
        assert.equal(first.classList.contains('page-reveal--visible'), false)
        observer.emit(first)
        assert.equal(first.classList.contains('page-reveal--visible'), false)
    } finally { if (view.container.isConnected) await view.unmount(); state.restore() }
})

for (const options of [{ reduced: true }, { supported: false }]) {
    test(`content stays visible with ${options.reduced ? 'reduced motion' : 'no IntersectionObserver'}`, async () => {
        const state = setup(options)
        const view = await mount(h(Page, { count: 2 }))
        try {
            assert.equal(view.container.querySelectorAll('.page-reveal--waiting').length, 0)
            assert.equal(state.observers.length, 0)
            await view.render(h(Page, { count: 3 }))
            await flushMutations()
            assert.equal(view.container.querySelectorAll('.page-reveal--waiting').length, 0)
        } finally { await view.unmount(); state.restore() }
    })
}
