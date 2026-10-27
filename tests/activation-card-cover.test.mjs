import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h, act } from 'react'
import { initReactI18next } from 'react-i18next'
import { installUiDom, mount, deferred } from './helpers/ui-dom.mjs'

const dom = installUiDom()
after(() => dom.dispose())
const { appI18n } = await import('../src/i18n/instance.ts')
await appI18n.use(initReactI18next).init({ lng: 'zh-Hans', resources: { 'zh-Hans': { translation: {} } }, keySeparator: false })
const { ActivationCardPage } = await import('../src/pages/main/activation-card/ActivationCardPage.tsx')
const { httpClient } = await import('../src/services/http/client.ts')

test('owned cards use API names, counts and list length while only covers come from local configuration', async () => {
    const previousAdapter = httpClient.defaults.adapter
    const cardGate = deferred()
    httpClient.defaults.adapter = async (config) => {
        if (config.url === '/api/activation_cards') await cardGate.promise
        const data = config.url === '/api/activation_cards'
            ? { list: [
                { id: 29, name: '后端自定义卡名', amount: '0.02', num: 2 },
                { id: 77, name: '零库存卡', amount: '88', num: 0 },
            ] }
            : { list: [] }
        return { data, status: 200, statusText: 'OK', headers: {}, config }
    }
    const view = await mount(h(ActivationCardPage))
    try {
        assert.equal(view.container.querySelectorAll('.activation-card-page__card').length, 0)
        await act(async () => { cardGate.resolve(); await cardGate.promise })
        const cards = [...view.container.querySelectorAll('.activation-card-page__card')]
        assert.equal(cards.length, 2)
        assert.deepEqual(cards.map((card) => card.querySelector('.activation-card-page__card-image').getAttribute('src').split('/').slice(-3).join('/')), [
            'assets/activation-card/card-10.webp',
            'assets/activation-card/card-20.webp',
        ])
        assert.deepEqual(cards.map((card) => card.querySelector('h3').textContent), ['后端自定义卡名', '零库存卡'])
        assert.deepEqual(cards.map((card) => card.querySelector('.activation-card-page__count').textContent), ['2张', '0张'])
        assert.deepEqual(cards.map((card) => card.querySelector('button').disabled), [false, true])
        await act(async () => cards[1].querySelector('button').click())
        assert.equal(document.querySelector('.activation-card-page__gift-form'), null)
        await act(async () => cards[0].querySelector('button').click())
        assert.ok(document.querySelector('.activation-card-page__gift-form').textContent.includes('后端自定义卡名'))
    } finally {
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})
