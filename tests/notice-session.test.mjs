import test from 'node:test'
import assert from 'node:assert/strict'

import { createNoticeReadSession } from '../src/features/notice/session.ts'

function notice(overrides = {}) {
    return {
        id: 101,
        title: 'Project notice',
        content: 'Notice content',
        updated_at: '2026-10-22T00:00:00.000Z',
        ...overrides,
    }
}

function createStorage(initialValue = null) {
    const cache = new Map()
    return {
        getItem: (key) => cache.get(key) ?? initialValue,
        setItem: (key, value) => { cache.set(key, String(value)) },
    }
}

test('a notice is unread until marked and read state follows its id and version', () => {
    const session = createNoticeReadSession(() => undefined)
    const current = notice()

    assert.equal(session.hasRead(current), false)
    session.markRead(current)
    assert.equal(session.hasRead(current), true)
    assert.equal(session.hasRead({ ...current, title: 'Updated display title', content: 'Updated display content' }), true)
    session.markRead({ ...current })
    assert.equal(session.hasRead(current), true)
})

test('a newer version of a previously read notice is unread', () => {
    const session = createNoticeReadSession(() => undefined)
    const original = notice()
    const updated = notice({ updated_at: '2026-10-22T01:00:00.000Z' })

    session.markRead(original)
    assert.equal(session.hasRead(original), true)
    assert.equal(session.hasRead(updated), false)
    session.markRead(updated)
    assert.equal(session.hasRead(updated), true)
})

test('notices with different ids keep independent read state', () => {
    const session = createNoticeReadSession(() => undefined)
    const first = notice()
    const second = notice({ id: 102 })

    session.markRead(first)
    assert.equal(session.hasRead(second), false)
    session.markRead(second)
    assert.equal(session.hasRead(first), true)
    assert.equal(session.hasRead(second), true)
})

test('a new read session restores saved notices without marking new ids or versions read', () => {
    const storage = createStorage()
    const first = notice()
    const second = notice({ id: 102 })
    const session = createNoticeReadSession(() => storage)
    session.markRead(first)
    session.markRead(second)

    const restored = createNoticeReadSession(() => storage)
    assert.equal(restored.hasRead({ ...first }), true)
    assert.equal(restored.hasRead({ ...second }), true)
    assert.equal(restored.hasRead(notice({ id: 103 })), false)
    assert.equal(restored.hasRead(notice({ updated_at: '2026-10-23T00:00:00.000Z' })), false)
})

const unavailableStorageCases = [
    ['no storage is available', () => undefined],
    ['accessing storage throws', () => { throw new Error('Storage access blocked') }],
    ['reading storage throws', () => ({
        getItem() { throw new Error('Storage reads blocked') },
        setItem() {},
    })],
    ['writing storage throws', () => ({
        getItem: () => null,
        setItem() { throw new Error('Storage writes blocked') },
    })],
]

for (const [description, getStorage] of unavailableStorageCases) {
    test(`read state falls back to memory when ${description}`, () => {
        let session
        assert.doesNotThrow(() => { session = createNoticeReadSession(getStorage) })
        const current = notice()
        assert.equal(session.hasRead(current), false)
        assert.doesNotThrow(() => session.markRead(current))
        assert.equal(session.hasRead({ ...current }), true)
        assert.equal(session.hasRead(notice({ id: 102 })), false)
        assert.equal(session.hasRead(notice({ updated_at: '2026-10-23T00:00:00.000Z' })), false)
    })
}

test('malformed or unexpected stored JSON does not prevent marking a notice read', () => {
    for (const value of ['{invalid-json', 'null', '"unexpected shape"']) {
        const storage = createStorage(value)
        let session
        assert.doesNotThrow(() => { session = createNoticeReadSession(() => storage) })
        const current = notice()
        assert.equal(session.hasRead(current), false)
        assert.doesNotThrow(() => session.markRead(current))
        assert.equal(session.hasRead(current), true)
    }
})
