import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h, act } from 'react'
import { initReactI18next } from 'react-i18next'
import { installUiDom, mount, deferred } from './helpers/ui-dom.mjs'

const dom = installUiDom()
after(() => dom.dispose())
const { appI18n } = await import('../src/i18n/instance.ts')
await appI18n.use(initReactI18next).init({ lng: 'zh-Hans', resources: { 'zh-Hans': { translation: {} } }, keySeparator: false })
const { TeamPage } = await import('../src/pages/main/team/TeamPage.tsx')
const { PageRefreshContext } = await import('../src/components/PagePullRefresh/context.ts')
const { httpClient } = await import('../src/services/http/client.ts')

function userWithCards(teamCards) {
    return {
        id: 7,
        address: '0x1111111111111111111111111111111111111111',
        team_count: 900,
        referral_count: 500,
        valid_referral_count: 300,
        kpi: '1',
        team_kpi: '100',
        referral_code: 'TEAM',
        usdt_balance: '200',
        num: 9999,
        team_cards: teamCards,
    }
}

function response(config, data) {
    return { data, status: 200, statusText: 'OK', headers: {}, config }
}

function cardValues(container) {
    return [...container.querySelectorAll('.team-page__activation-card')].map((card) => ({
        name: card.querySelector('h3').textContent,
        metrics: Object.fromEntries([...card.querySelectorAll('dt')].map((term) => [
            term.textContent,
            term.nextElementSibling.textContent.replace(/\s/g, ''),
        ])),
    }))
}

function emptyCardValues() {
    return Array.from({ length: 3 }, () => ({
        name: '--',
        metrics: { 持有人数: '--', 持有总量: '--' },
    }))
}

test('team cards preserve arbitrary API names and server order while using fixed covers and keeping zero holdings', async () => {
    const previousAdapter = httpClient.defaults.adapter
    const userGate = deferred()
    const requests = []
    httpClient.defaults.adapter = async (config) => {
        requests.push(config.url)
        if (config.url === '/api/users/my') {
            await userGate.promise
            return response(config, userWithCards([
                { id: 29, name: '后端重命名的完整卡名', holder_count: 1, num: 4 },
                { id: 77, name: '10 USDT 激活卡（新名称）', holder_count: 7, num: 37 },
                { id: 42, name: 'Server card C', holder_count: 0, num: 0 },
            ]))
        }
        assert.equal(config.url, '/api/users/my/referrals')
        return response(config, { referrals: [] })
    }
    const view = await mount(h(TeamPage))
    try {
        assert.deepEqual(cardValues(view.container), emptyCardValues())
        await act(async () => { userGate.resolve(); await userGate.promise })
        assert.deepEqual(cardValues(view.container), [
            { name: '后端重命名的完整卡名', metrics: { 持有人数: '1人', 持有总量: '4张' } },
            { name: '10 USDT 激活卡（新名称）', metrics: { 持有人数: '7人', 持有总量: '37张' } },
            { name: 'Server card C', metrics: { 持有人数: '0人', 持有总量: '0张' } },
        ])
        const covers = [...view.container.querySelectorAll('.team-page__activation-card-image')]
        assert.deepEqual(covers.map((cover) => cover.getAttribute('src').split('/').slice(-3).join('/')), [
            'assets/activation-card/card-10.webp',
            'assets/activation-card/card-20.webp',
            'assets/activation-card/card-30.webp',
        ])
        assert.deepEqual(requests.sort(), ['/api/users/my', '/api/users/my/referrals'].sort())
    } finally {
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})

test('team refresh reloads team cards and waits for both user data and referrals', async () => {
    const previousAdapter = httpClient.defaults.adapter
    const userGate = deferred()
    const referralGate = deferred()
    let userRequests = 0
    let referralRequests = 0
    let refresh
    const context = {
        registerPageRefresh(handler) {
            refresh = handler
            return () => { if (refresh === handler) refresh = undefined }
        },
    }
    httpClient.defaults.adapter = async (config) => {
        if (config.url === '/api/users/my') {
            const isRefresh = ++userRequests > 1
            if (isRefresh) await userGate.promise
            return response(config, userWithCards([
                { id: 17, name: isRefresh ? '刷新后的完整新名称' : '初始完整新名称', holder_count: isRefresh ? 3 : 2, num: isRefresh ? 17 : 5 },
            ]))
        }
        assert.equal(config.url, '/api/users/my/referrals')
        if (++referralRequests > 1) await referralGate.promise
        return response(config, { referrals: [] })
    }
    const view = await mount(h(PageRefreshContext.Provider, { value: context }, h(TeamPage)))
    try {
        assert.deepEqual(cardValues(view.container), [
            { name: '初始完整新名称', metrics: { 持有人数: '2人', 持有总量: '5张' } },
            ...emptyCardValues().slice(1),
        ])
        assert.equal(typeof refresh, 'function')
        let refreshed = false
        let refreshPromise
        await act(async () => {
            refreshPromise = refresh().then(() => { refreshed = true })
            await Promise.resolve()
        })
        assert.equal(refreshed, false)
        await act(async () => { userGate.resolve(); await userGate.promise })
        assert.deepEqual(cardValues(view.container), [
            { name: '刷新后的完整新名称', metrics: { 持有人数: '3人', 持有总量: '17张' } },
            ...emptyCardValues().slice(1),
        ])
        assert.equal(refreshed, false)
        await act(async () => { referralGate.resolve(); await refreshPromise })
        assert.equal(refreshed, true)
        assert.equal(userRequests, 2)
        assert.equal(referralRequests, 2)
    } finally {
        userGate.resolve()
        referralGate.resolve()
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})

test('failed team loads keep three unknown cards and empty referrals without page retry feedback, then recover on pull refresh', async () => {
    const previousAdapter = httpClient.defaults.adapter
    let failRequests = true
    let refresh
    const context = {
        registerPageRefresh(handler) {
            refresh = handler
            return () => { if (refresh === handler) refresh = undefined }
        },
    }
    httpClient.defaults.adapter = async (config) => {
        if (failRequests) throw new Error('Team request failed')
        if (config.url === '/api/users/my') {
            return response(config, userWithCards([
                { id: 17, name: '恢复后真实卡名称', holder_count: 4, num: 9 },
            ]))
        }
        assert.equal(config.url, '/api/users/my/referrals')
        return response(config, { referrals: [
            { id: 25, address: '0x2222****2222', created_at: '2026.10.30 12:00', team_kpi: '12', kpi: '3' },
        ] })
    }
    const view = await mount(h(PageRefreshContext.Provider, { value: context }, h(TeamPage)))
    try {
        assert.equal(view.container.querySelector('.api-state__retry'), null)
        assert.doesNotMatch(view.container.textContent, /加载失败|重试/)
        assert.deepEqual([...view.container.querySelectorAll('.team-page__stat-value')].map((value) => value.textContent), ['--', '--', '--'])
        assert.deepEqual([...view.container.querySelectorAll('.team-page__performance dd')].map((value) => value.textContent), ['--', '--'])
        assert.equal(view.container.querySelector('.team-page__referral-link').textContent, '--')
        assert.equal(view.container.querySelector('.team-page__copy').disabled, true)
        assert.deepEqual(cardValues(view.container), emptyCardValues())
        assert.equal(view.container.querySelectorAll('.empty').length, 1)
        assert.equal(view.container.querySelectorAll('.api-state__more').length, 0)

        failRequests = false
        assert.equal(typeof refresh, 'function')
        await act(async () => { await refresh() })
        assert.deepEqual(cardValues(view.container), [
            { name: '恢复后真实卡名称', metrics: { 持有人数: '4人', 持有总量: '9张' } },
            ...emptyCardValues().slice(1),
        ])
        assert.deepEqual([...view.container.querySelectorAll('.team-page__stat-value')].map((value) => value.textContent), ['900', '500', '300'])
        assert.match(view.container.querySelector('.team-page__referral-link').textContent, /\/ref\/TEAM$/)
        assert.equal(view.container.querySelector('.team-page__copy').disabled, false)
        assert.equal(view.container.querySelectorAll('.team-page__member').length, 1)
        assert.equal(view.container.querySelectorAll('.empty').length, 0)
        assert.equal(view.container.querySelector('.api-state__retry'), null)
    } finally {
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})

test('missing team and member performance values stay unknown while real zeros remain visible', async () => {
    const previousAdapter = httpClient.defaults.adapter
    let showZeros = false
    let refresh
    const context = {
        registerPageRefresh(handler) {
            refresh = handler
            return () => { if (refresh === handler) refresh = undefined }
        },
    }
    httpClient.defaults.adapter = async (config) => {
        if (config.url === '/api/users/my') {
            return response(config, {
                ...userWithCards([{ id: 17, name: '真实完整卡名', holder_count: showZeros ? 0 : null, num: showZeros ? 0 : undefined }]),
                team_count: showZeros ? 0 : null,
                referral_count: showZeros ? 0 : undefined,
                valid_referral_count: 0,
                team_kpi: showZeros ? '0' : null,
                kpi: showZeros ? '0' : undefined,
            })
        }
        assert.equal(config.url, '/api/users/my/referrals')
        return response(config, { referrals: [
            { id: 25, address: '0x2222****2222', created_at: '2026.10.30 12:00', team_kpi: showZeros ? '0' : null, kpi: showZeros ? '0' : undefined },
        ] })
    }
    const view = await mount(h(PageRefreshContext.Provider, { value: context }, h(TeamPage)))
    try {
        assert.deepEqual([...view.container.querySelectorAll('.team-page__stat-value')].map((value) => value.textContent), ['--', '--', '0'])
        assert.deepEqual([...view.container.querySelectorAll('.team-page__performance dd')].map((value) => value.textContent), ['--', '--'])
        assert.deepEqual([...view.container.querySelectorAll('.team-page__member-value')].map((value) => value.textContent), ['--', '--'])
        assert.deepEqual(cardValues(view.container), [
            { name: '真实完整卡名', metrics: { 持有人数: '--', 持有总量: '--' } },
            ...emptyCardValues().slice(1),
        ])

        showZeros = true
        await act(async () => { await refresh() })
        assert.deepEqual([...view.container.querySelectorAll('.team-page__stat-value')].map((value) => value.textContent), ['0', '0', '0'])
        assert.deepEqual([...view.container.querySelectorAll('.team-page__performance dd')].map((value) => value.textContent), ['0.00', '0.00'])
        assert.deepEqual([...view.container.querySelectorAll('.team-page__member-value')].map((value) => value.textContent), ['0.00', '0.00'])
        assert.deepEqual(cardValues(view.container), [
            { name: '真实完整卡名', metrics: { 持有人数: '0人', 持有总量: '0张' } },
            ...emptyCardValues().slice(1),
        ])
    } finally {
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})

test('partial responses fill slots in server order and empty responses leave three covers with unknown names and counts', async () => {
    const previousAdapter = httpClient.defaults.adapter
    const userGate = deferred()
    let teamCards = [{ id: 902, name: '20 usdt 激活卡', holder_count: 12, num: 25 }]
    let refresh
    const context = {
        registerPageRefresh(handler) {
            refresh = handler
            return () => { if (refresh === handler) refresh = undefined }
        },
    }
    httpClient.defaults.adapter = async (config) => {
        if (config.url === '/api/users/my') {
            await userGate.promise
            return response(config, userWithCards(teamCards))
        }
        assert.equal(config.url, '/api/users/my/referrals')
        return response(config, { referrals: [] })
    }
    const view = await mount(h(PageRefreshContext.Provider, { value: context }, h(TeamPage)))
    try {
        assert.deepEqual(cardValues(view.container), emptyCardValues())
        await act(async () => { userGate.resolve(); await userGate.promise })
        assert.deepEqual(cardValues(view.container), [
            { name: '20 usdt 激活卡', metrics: { 持有人数: '12人', 持有总量: '25张' } },
            ...emptyCardValues().slice(1),
        ])
        teamCards = []
        await act(async () => { await refresh() })
        assert.deepEqual(cardValues(view.container), emptyCardValues())
        assert.equal(view.container.querySelectorAll('.team-page__activation-card-image').length, 3)
        assert.equal(view.container.querySelectorAll('.empty').length, 1)
    } finally {
        userGate.resolve()
        await view.unmount()
        httpClient.defaults.adapter = previousAdapter
    }
})
