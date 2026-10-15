import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement as h, act } from 'react'
import { compileString } from 'sass-embedded'

import { installUiDom, mount } from './helpers/ui-dom.mjs'

const dom = installUiDom()
after(() => dom.dispose())
const { SegmentedTabs } = await import('../src/components/SegmentedTabs/SegmentedTabs.tsx')
const styleUrl = new URL('../src/components/SegmentedTabs/SegmentedTabs.scss', import.meta.url)
const stylesheet = document.createElement('style')
stylesheet.textContent = compileString(
    `@use "${new URL('../src/styles/mixins.scss', import.meta.url).pathname}" as *;\n${await readFile(styleUrl, 'utf8')}`,
    { url: styleUrl },
).css
document.head.appendChild(stylesheet)

const initialOptions = [
    { value: 'all', label: 'All reservations', id: 'tab-all', panelId: 'records' },
    { value: 'pending', label: 'Pending reservations' },
    { value: 'active', label: 'Active reservations' },
    { value: 'finished', label: 'Finished reservations' },
]

function installHorizontalGeometry(view, initialWidths, viewportWidth = 240) {
    const root = view.container.querySelector('[role="tablist"]')
    const buttons = [...root.querySelectorAll('[role="tab"]')]
    let widths = initialWidths
    let scrollLeft = 0
    let reads = 0
    const writes = []
    const gap = 12
    const left = 100
    const border = 2
    const contentWidth = () => widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1)
    Object.defineProperties(root, {
        clientWidth: { configurable: true, get: () => viewportWidth },
        clientLeft: { configurable: true, get: () => border },
        scrollWidth: { configurable: true, get: contentWidth },
        scrollLeft: {
            configurable: true,
            get: () => scrollLeft,
            set: (value) => { writes.push(value); scrollLeft = value },
        },
    })
    root.scrollTop = 73
    root.getBoundingClientRect = () => {
        reads++
        return { left, right: left + viewportWidth + border * 2, width: viewportWidth + border * 2, top: 800, bottom: 850, height: 50 }
    }
    buttons.forEach((button, index) => {
        button.getBoundingClientRect = () => {
            reads++
            const offset = widths.slice(0, index).reduce((sum, width) => sum + width, 0) + gap * index
            const buttonLeft = left + border + offset - scrollLeft
            return { left: buttonLeft, right: buttonLeft + widths[index], width: widths[index], top: 800, bottom: 850, height: 50 }
        }
        button.scrollIntoView = () => { throw new Error('Tabs must never scroll the page through scrollIntoView') }
    })

    return {
        root, buttons, writes,
        setWidths: (next) => { widths = next },
        isVisible(index) {
            const rect = buttons[index].getBoundingClientRect()
            return rect.left >= left + border && rect.right <= left + border + viewportWidth
        },
        get reads() { return reads },
        get viewportLeft() { return left + border },
        get maxScrollLeft() { return contentWidth() - viewportWidth },
    }
}

async function key(button, value) {
    await act(async () => button.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true })))
}

test('pills retain full translated labels as non-shrinking tabs in a native horizontal scroller', async () => {
    const translatedLabel = 'Alle abgeschlossenen Reservierungen und Teilnahmen'
    const options = initialOptions.map((option, index) => index === 3 ? { ...option, label: translatedLabel } : option)
    const view = await mount(h(SegmentedTabs, { variant: 'pills', options, value: 'all', onChange: () => {} }))
    try {
        const root = view.container.querySelector('[role="tablist"]')
        const tabs = [...root.querySelectorAll('[role="tab"]')]
        const rootStyle = dom.window.getComputedStyle(root)
        const tabStyle = dom.window.getComputedStyle(tabs[3])
        assert.equal(rootStyle.overflowX, 'auto')
        assert.equal(rootStyle.overflowY, 'hidden')
        assert.equal(tabStyle.whiteSpace, 'nowrap')
        assert.equal(tabStyle.flexShrink, '0')
        assert.equal(tabStyle.width, 'max-content')
        assert.notEqual(tabStyle.textOverflow, 'ellipsis')
        assert.equal(tabs[3].textContent, translatedLabel)
        assert.equal(root.querySelector('.segmented-tabs__indicator'), null)
        assert.equal(tabs[0].id, 'tab-all')
        assert.equal(tabs[0].getAttribute('aria-controls'), 'records')
        assert.equal(tabs[1].hasAttribute('aria-controls'), false)
        assert.equal(root.hasAttribute('variant'), false)
    } finally { await view.unmount() }
})

test('controlled selection and changed translations reveal the active pill using horizontal scroll only', async () => {
    const props = { variant: 'pills', options: initialOptions, value: 'all', onChange: () => {} }
    const view = await mount(h(SegmentedTabs, props))
    const previousScroll = dom.window.scrollTo
    dom.window.scrollTo = () => { throw new Error('Tabs must not scroll the window') }
    try {
        const geometry = installHorizontalGeometry(view, [100, 100, 100, 120])
        document.documentElement.scrollTop = 319
        await view.render(h(SegmentedTabs, { ...props, value: 'finished' }))
        assert.equal(geometry.isVisible(3), true)
        assert.equal(geometry.root.scrollLeft, geometry.maxScrollLeft)
        assert.equal(geometry.root.scrollTop, 73)
        assert.equal(document.documentElement.scrollTop, 319)

        await view.render(h(SegmentedTabs, { ...props, value: 'all' }))
        assert.equal(geometry.root.scrollLeft, 0)
        assert.equal(geometry.isVisible(0), true)

        await view.render(h(SegmentedTabs, { ...props, value: 'active' }))
        assert.equal(geometry.isVisible(2), true)
        const scrollBeforeTranslation = geometry.root.scrollLeft
        geometry.setWidths([100, 230, 180, 120])
        const translated = initialOptions.map((option) => ({ ...option, label: `${option.label} translated into a longer language` }))
        await view.render(h(SegmentedTabs, { ...props, value: 'active', options: translated }))
        assert.equal(geometry.isVisible(2), true)
        assert.ok(geometry.root.scrollLeft > scrollBeforeTranslation)
        assert.equal(geometry.root.scrollTop, 73)
        assert.equal(document.documentElement.scrollTop, 319)

        const previousWrites = geometry.writes.length
        await view.render(h(SegmentedTabs, { ...props, value: 'active', options: [...translated] }))
        assert.equal(geometry.writes.length, previousWrites, 'an already visible selection should not move')
    } finally { dom.window.scrollTo = previousScroll; await view.unmount() }
})

test('a pill wider than the viewport aligns its leading edge without oscillating across renders', async () => {
    const props = { variant: 'pills', options: initialOptions, value: 'all', onChange: () => {} }
    const view = await mount(h(SegmentedTabs, props))
    try {
        const geometry = installHorizontalGeometry(view, [100, 100, 400, 120])
        await view.render(h(SegmentedTabs, { ...props, value: 'active' }))
        assert.equal(geometry.buttons[2].getBoundingClientRect().left, geometry.viewportLeft)
        const previousWrites = geometry.writes.length
        await view.render(h(SegmentedTabs, { ...props, value: 'active', options: [...initialOptions] }))
        assert.equal(geometry.buttons[2].getBoundingClientRect().left, geometry.viewportLeft)
        assert.equal(geometry.writes.length, previousWrites)
    } finally { await view.unmount() }
})

test('pills keyboard navigation reveals focus, skips disabled options and prevents page scrolling before controlled selection updates', async () => {
    const values = []
    const options = initialOptions.map((option) => ({ ...option, disabled: option.value === 'pending' }))
    const view = await mount(h(SegmentedTabs, { variant: 'pills', options, value: 'all', onChange: (value) => values.push(value) }))
    try {
        const geometry = installHorizontalGeometry(view, [100, 100, 100, 120])
        const focusOptions = []
        for (const button of geometry.buttons) {
            const focus = button.focus.bind(button)
            button.focus = (options) => { focusOptions.push(options); focus(options) }
        }
        await key(geometry.buttons[0], 'ArrowRight')
        assert.equal(document.activeElement, geometry.buttons[2])
        assert.equal(geometry.isVisible(2), true)
        assert.equal(values.at(-1), 'active')
        await key(geometry.buttons[2], 'End')
        assert.equal(document.activeElement, geometry.buttons[3])
        assert.equal(geometry.isVisible(3), true)
        assert.equal(values.at(-1), 'finished')
        await key(geometry.buttons[3], 'Home')
        assert.equal(document.activeElement, geometry.buttons[0])
        assert.equal(geometry.isVisible(0), true)
        await key(geometry.buttons[0], 'ArrowLeft')
        assert.equal(document.activeElement, geometry.buttons[3])
        assert.equal(geometry.isVisible(3), true)
        assert.equal(geometry.buttons[0].getAttribute('aria-selected'), 'true', 'selection stays controlled by the parent')
        assert.ok(focusOptions.every((options) => options?.preventScroll === true))
        assert.equal(geometry.root.scrollTop, 73)
    } finally { await view.unmount() }
})

test('default segmented tabs retain their indicator and do not measure or scroll horizontally', async () => {
    const values = []
    const props = { options: initialOptions, value: 'all', onChange: (value) => values.push(value) }
    const view = await mount(h(SegmentedTabs, props))
    try {
        const geometry = installHorizontalGeometry(view, [100, 100, 100, 120])
        assert.ok(geometry.root.querySelector('.segmented-tabs__indicator'))
        assert.equal(geometry.root.classList.contains('segmented-tabs--pills'), false)
        await view.render(h(SegmentedTabs, { ...props, value: 'finished', options: [...initialOptions] }))
        await key(geometry.buttons[0], 'End')
        assert.equal(document.activeElement, geometry.buttons[3])
        assert.equal(values.at(-1), 'finished')
        assert.equal(geometry.reads, 0)
        assert.deepEqual(geometry.writes, [])
        assert.equal(geometry.root.scrollLeft, 0)
    } finally { await view.unmount() }
})
