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

test('owned card covers stay configured locally when the API is loading or omits card types', async () => {
    const previousAdapter = httpClient.defaults.adapter
    const cardGate = deferred()
    httpClient.defaults.adapter = async (config) => {
        if (config.url === '/api/activation_cards') await cardGate.promise
        const data = config.url === '/api/activation_cards'
            ? { list: [{ id: 29, name: 'Server supplied name', amount: '20', num: 2 }] }
            : { list: [] }
        return { data, status: 200, statusText: 'OK', headers: {}, config }
    }
    const view = await mount(h(ActivationCardPage))
    try {
        function checkCovers() {
            const cards = [...view.container.querySelectorAll('.activation-card-page__card')]
            assert.equal(cards.length, 3)
            assert.deepEqual(cards.map((card) => card.querySelector('.activation-card-page__card-image').getAttribute('src').split('/').slice(-3).join('/')), [
                'assets/activation-card/card-10.webp',
                'assets/activation-card/card-20.webp',
                'assets/activation-card/card-30.webp',
            ])
            return cards
        }
        checkCovers()
        await act(async () => { cardGate.resolve(); await cardGate.promise })
        const cards = checkCovers()
        assert.deepEqual(cards.map((card) => card.querySelector('h3').textContent), ['10＄激活卡', '20＄激活卡', '30＄激活卡'])
        assert.deepEqual(cards.map((card) => card.querySelector('.activation-card-page__count').textContent), ['--', '2张', '--'])
        assert.deepEqual(cards.map((card) => card.querySelector('button').disabled), [true, false, true])
    } finally {
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})
