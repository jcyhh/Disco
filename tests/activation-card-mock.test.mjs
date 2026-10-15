import test from 'node:test'
import assert from 'node:assert/strict'

import {
    getActivationCardRecords,
    mockActivationCards,
    mockActivationCardRecords,
} from '../src/mock/activation-card.ts'
import { validateActivationCardGift } from '../src/pages/main/activation-card/gift.ts'

const address = '0x0000000000000000000000000000000000000001'

test('activation-card inventory includes available and exhausted denominations without duplicate identities', () => {
    assert.deepEqual(mockActivationCards.map(({ faceValue }) => faceValue), [10, 20, 30])
    assert.equal(new Set(mockActivationCards.map(({ id }) => id)).size, mockActivationCards.length)
    const available = mockActivationCards.filter(({ ownedCount }) => ownedCount > 0)
    const exhausted = mockActivationCards.find(({ ownedCount }) => ownedCount === 0)
    assert.equal(available.length, 2)
    assert.ok(exhausted)
    assert.equal(validateActivationCardGift({ address, quantity: '1', ownedCount: exhausted.ownedCount }), 'insufficient-cards')
    for (const card of available) {
        assert.equal(validateActivationCardGift({ address, quantity: String(card.ownedCount), ownedCount: card.ownedCount }), undefined)
        assert.equal(validateActivationCardGift({ address, quantity: String(card.ownedCount + 1), ownedCount: card.ownedCount }), 'insufficient-cards')
    }
})

test('activation-card history collapses to four records and expands through new arrays without changing its source', () => {
    const snapshot = structuredClone(mockActivationCardRecords)
    const collapsed = getActivationCardRecords()
    const expanded = getActivationCardRecords(true)
    assert.equal(new Set(mockActivationCardRecords.map(({ id }) => id)).size, mockActivationCardRecords.length)
    assert.equal(collapsed.length, 4)
    assert.deepEqual(collapsed, mockActivationCardRecords.slice(0, 4))
    assert.equal(expanded.length, 8)
    assert.deepEqual(expanded, mockActivationCardRecords)
    assert.notStrictEqual(collapsed, mockActivationCardRecords)
    assert.notStrictEqual(expanded, mockActivationCardRecords)
    expanded.reverse()
    collapsed.pop()
    assert.deepEqual(mockActivationCardRecords, snapshot)

    const shortSource = Object.freeze(mockActivationCardRecords.slice(0, 2).map((record) => Object.freeze({ ...record })))
    for (const expanded of [false, true]) {
        const result = getActivationCardRecords(expanded, shortSource)
        assert.deepEqual(result, shortSource)
        assert.notStrictEqual(result, shortSource)
    }
    assert.deepEqual(getActivationCardRecords(false, []), [])
    assert.deepEqual(getActivationCardRecords(true, []), [])
})

test('gift recipient validation trims surrounding whitespace and accepts locally valid mixed-case addresses', () => {
    for (const value of ['', '  \n\t  ']) {
        assert.equal(validateActivationCardGift({ address: value, quantity: '1', ownedCount: 2 }), 'address-required')
    }
    for (const value of ['not-a-wallet', '0x1234', `0x${'z'.repeat(40)}`, `0x${'1'.repeat(39)}`, `0x${'1'.repeat(41)}`]) {
        assert.equal(validateActivationCardGift({ address: value, quantity: '1', ownedCount: 2 }), 'address-invalid')
    }
    assert.equal(validateActivationCardGift({ address: `  ${address}\n`, quantity: '1', ownedCount: 2 }), undefined)
    assert.equal(validateActivationCardGift({ address: '0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD', quantity: '1', ownedCount: 2 }), undefined)
})

test('gift quantity requires a positive safe integer within available inventory and never changes input or mock data', () => {
    for (const quantity of ['', '0', '000', '-1', '+1', '1.1', '1e2', 'NaN', 'Infinity', ' 1 ', '1,000', '0x10', String(Number.MAX_SAFE_INTEGER + 1)]) {
        assert.equal(validateActivationCardGift({ address, quantity, ownedCount: 10 }), 'quantity-invalid', quantity)
    }
    assert.equal(validateActivationCardGift({ address, quantity: '3', ownedCount: 2 }), 'insufficient-cards')
    assert.equal(validateActivationCardGift({ address, quantity: '2', ownedCount: 2 }), undefined)
    assert.equal(validateActivationCardGift({ address, quantity: String(Number.MAX_SAFE_INTEGER), ownedCount: Number.MAX_SAFE_INTEGER }), undefined)

    const cardsSnapshot = structuredClone(mockActivationCards)
    const recordsSnapshot = structuredClone(mockActivationCardRecords)
    const input = Object.freeze({ address: ` ${address} `, quantity: '1', ownedCount: 2 })
    assert.equal(validateActivationCardGift(input), undefined)
    assert.deepEqual(input, { address: ` ${address} `, quantity: '1', ownedCount: 2 })
    assert.deepEqual(mockActivationCards, cardsSnapshot)
    assert.deepEqual(mockActivationCardRecords, recordsSnapshot)
})
