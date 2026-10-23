import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

const aliases = registerHooks({
    resolve(specifier, context, nextResolve) {
        return nextResolve(specifier.startsWith('@/')
            ? new URL(`../src/${specifier.slice(2)}`, import.meta.url).href : specifier, context)
    },
})
const {
    mockNotices,
    loadMockNotices,
    loadMockNotice,
    markMockNoticeRead,
    loadMockPopNotice,
} = await import('../src/mock/notice.ts')
aliases.deregister()

test('notice pagination reaches every record once, handles the final partial page and preserves its source', async () => {
    const snapshot = structuredClone(mockNotices)
    const pageSize = 2
    const results = []
    for (let page = 1; page <= Math.ceil(mockNotices.length / pageSize); page++) {
        const { notices } = await loadMockNotices({ page_no: page, page_size: pageSize })
        assert.ok(notices.length <= pageSize)
        results.push(...notices)
    }
    assert.deepEqual(results, mockNotices)
    assert.equal(new Set(results.map(({ id }) => id)).size, results.length)
    const beyondEnd = await loadMockNotices({ page_no: Math.ceil(mockNotices.length / pageSize) + 1, page_size: pageSize })
    assert.deepEqual(beyondEnd.notices, [])
    const largestPage = await loadMockNotices({ page_no: 1, page_size: Number.MAX_SAFE_INTEGER })
    assert.deepEqual(largestPage.notices, mockNotices)
    assert.notStrictEqual(largestPage.notices, mockNotices)
    largestPage.notices.reverse()
    largestPage.notices.pop()
    assert.deepEqual(mockNotices, snapshot)
})

test('notice pagination rejects non-positive or unsafe page numbers and sizes', async () => {
    for (const value of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
        await assert.rejects(loadMockNotices({ page_no: value, page_size: 2 }), RangeError)
        await assert.rejects(loadMockNotices({ page_no: 1, page_size: value }), RangeError)
    }
    assert.deepEqual((await loadMockNotices({ page_no: Number.MAX_SAFE_INTEGER, page_size: 1 })).notices, [])
})

test('notice details resolve current records and return null for missing or invalid identities without changing data', async () => {
    const snapshot = structuredClone(mockNotices)
    assert.ok(mockNotices.length > 0)
    for (const notice of mockNotices) {
        assert.deepEqual(await loadMockNotice(notice.id), notice)
    }
    const missingId = Math.max(...mockNotices.map(({ id }) => id)) + 1
    for (const id of [missingId, 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
        assert.equal(await loadMockNotice(id), null)
    }
    assert.deepEqual(mockNotices, snapshot)
})

test('mock popup notices stop showing read records while read actions leave content and pagination untouched', async () => {
    const snapshot = structuredClone(mockNotices)
    const popup = await loadMockPopNotice()
    if (popup.is_show) {
        assert.equal(Array.isArray(popup.notice), false)
        assert.ok(mockNotices.some(({ id, updated_at }) => id === popup.notice.id && updated_at === popup.notice.updated_at))
        markMockNoticeRead(popup.notice.id)
        const afterRead = await loadMockPopNotice()
        assert.ok(!afterRead.is_show || afterRead.notice.id !== popup.notice.id)
    }

    for (const notice of mockNotices) markMockNoticeRead(notice.id)
    const afterAllRead = await loadMockPopNotice()
    assert.equal(afterAllRead.is_show, false)
    assert.deepEqual(afterAllRead.notice, [])
    markMockNoticeRead(Math.max(...mockNotices.map(({ id }) => id)) + 1)
    assert.deepEqual((await loadMockNotices({ page_no: 1, page_size: Number.MAX_SAFE_INTEGER })).notices, snapshot)
    assert.deepEqual(mockNotices, snapshot)
})
