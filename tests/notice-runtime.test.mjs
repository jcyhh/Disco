import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { createElement as h, act } from 'react'
import { initReactI18next } from 'react-i18next'

import { installUiDom, mount, deferred } from './helpers/ui-dom.mjs'

const dom = installUiDom()
const { appI18n } = await import('../src/i18n/instance.ts')
await appI18n.use(initReactI18next).init({ lng: 'en', resources: { en: { translation: {} } }, keySeparator: false })
const apiUrl = `data:text/javascript;base64,${Buffer.from(`
let api;
export function setNoticeApi(next) { api = next; }
export function getNotices(params) { return api.getNotices(params); }
export function getNotice(id) { return api.getNotice(id); }
export async function markNoticeRead(id) { return api.markNoticeRead(id); }
`).toString('base64')}`
const apiHooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        return nextResolve(/^@\/features\/notice\/api(?:\.ts)?$/.test(specifier) ? apiUrl : specifier, context)
    },
})
after(() => { apiHooks.deregister(); dom.dispose() })
const { setNoticeApi } = await import(apiUrl)
const { useNoticeDetail } = await import('../src/pages/notice/useNoticeDetail.ts')
const { useNoticeList } = await import('../src/pages/notice/useNoticeList.ts')
const { parseNoticeId } = await import('../src/pages/notice/utils.ts')

function notice(id) {
    return { id, title: `Notice ${id}`, content: `Content ${id}`, updated_at: '2026-10-22 10:00' }
}

test('notice route ids only accept positive safe integer strings', () => {
    for (const value of [undefined, '', '0', '-1', '1.5', '1e2', '01', '+1', ' 1 ', 'NaN', String(Number.MAX_SAFE_INTEGER + 1)]) {
        assert.equal(parseNoticeId(value), null, String(value))
    }
    assert.equal(parseNoticeId('12'), 12)
    assert.equal(parseNoticeId(String(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER)
})

test('changing the detail id isolates stale success or failure and only marks the current record read', async () => {
    for (const lateResult of ['success', 'failure']) {
        const first = deferred()
        const second = deferred()
        const requests = []
        const reads = []
        let current
        setNoticeApi({
            getNotice(id) { requests.push(id); return id === 11 ? first.promise : second.promise },
            markNoticeRead(id) { reads.push(id) },
        })
        function Detail({ id }) { current = useNoticeDetail(id); return null }
        const view = await mount(h(Detail, { id: 11 }))
        try {
            assert.equal(current.loading, true)
            await view.render(h(Detail, { id: 22 }))
            assert.deepEqual(requests, [11, 22])
            assert.equal(current.notice, null)
            assert.equal(current.loading, true)

            await act(async () => { second.resolve(notice(22)); await second.promise })
            assert.equal(current.notice.id, 22)
            assert.equal(current.loading, false)
            assert.deepEqual(reads, [22])

            await act(async () => {
                if (lateResult === 'success') first.resolve(notice(11))
                else first.reject(new Error('Old detail failed'))
                await Promise.resolve()
            })
            assert.equal(current.notice.id, 22)
            assert.equal(current.error, false)
            assert.equal(current.loading, false)
            assert.deepEqual(reads, [22])

            await view.render(h(Detail, { id: null }))
            assert.equal(current.notice, null)
            assert.equal(current.loading, false)
            assert.deepEqual(requests, [11, 22], 'an invalid route must not load a detail')
        } finally { await view.unmount() }
    }
})

test('unmounting a detail invalidates its pending read before it can mark the notice read', async () => {
    const work = deferred()
    const reads = []
    setNoticeApi({ getNotice: () => work.promise, markNoticeRead: (id) => reads.push(id) })
    function Detail() { useNoticeDetail(31); return null }
    const view = await mount(h(Detail))
    await view.unmount()
    await act(async () => { work.resolve(notice(31)); await work.promise })
    assert.deepEqual(reads, [])
})

test('refresh supersedes an in-flight next page, waits for its own data and prevents duplicate pagination', async () => {
    const requests = []
    let current
    setNoticeApi({
        getNotices(params) {
            const work = deferred()
            requests.push({ ...params, ...work })
            return work.promise
        },
    })
    function List() { current = useNoticeList(); return null }
    const view = await mount(h(List))
    try {
        assert.equal(requests.length, 1)
        assert.equal(requests[0].page_no, 1)
        const firstPage = Array.from({ length: requests[0].page_size }, (_, index) => notice(index + 1))
        await act(async () => { requests[0].resolve({ notices: firstPage }); await requests[0].promise })
        assert.equal(current.hasMore, true)

        let nextPage, duplicate
        await act(async () => { nextPage = current.loadMore(); duplicate = current.loadMore() })
        assert.strictEqual(nextPage, duplicate)
        assert.equal(requests.length, 2)
        assert.equal(requests[1].page_no, 2)

        let refresh, refreshed = false
        await act(async () => { refresh = current.reload(); refresh.then(() => { refreshed = true }) })
        assert.equal(requests.length, 3)
        assert.equal(requests[2].page_no, 1)
        assert.equal(current.loading, true)
        assert.equal(refreshed, false)

        await act(async () => { requests[1].resolve({ notices: [notice(91)] }); await nextPage })
        assert.deepEqual(current.notices, [], 'the obsolete next page cannot append data during a replacement refresh')
        assert.equal(current.loading, true, 'the older request cannot finish the refresh spinner')
        assert.equal(refreshed, false)

        const replacement = Array.from({ length: requests[2].page_size - 1 }, (_, index) => notice(index + 100))
        await act(async () => { requests[2].resolve({ notices: replacement }); await refresh })
        assert.equal(refreshed, true)
        assert.deepEqual(current.notices, replacement)
        assert.equal(current.loading, false)
        assert.equal(current.error, false)
        assert.equal(current.hasMore, false)
        await act(async () => { await current.loadMore() })
        assert.equal(requests.length, 3, 'end-of-list does not request another page')
    } finally { await view.unmount() }
})
