import test from 'node:test'
import assert from 'node:assert/strict'

import { getMockReservationRecords, mockReservationRecords } from '../src/mock/reservation.ts'

test('reservation status filtering preserves source records and optional display amounts', () => {
    const snapshot = structuredClone(mockReservationRecords)
    const statuses = ['queued', 'active', 'selling', 'completed']
    assert.equal(new Set(mockReservationRecords.map((record) => record.id)).size, mockReservationRecords.length)

    for (const status of statuses) {
        const records = getMockReservationRecords(status)
        assert.notStrictEqual(records, mockReservationRecords)
        assert.ok(records.length > 0)
        assert.equal(records.every((record) => record.status === status), true)
    }

    const completed = getMockReservationRecords('completed')
    assert.equal(completed.filter((record) => record.yieldReduction !== undefined).length, 1)
    assert.equal(completed.filter((record) => !Object.hasOwn(record, 'yieldReduction')).length, 2)
    assert.deepEqual(mockReservationRecords, snapshot)

    const withoutReduction = completed.find((record) => !Object.hasOwn(record, 'yieldReduction'))
    const fixture = Object.freeze([
        Object.freeze({ ...completed[0], id: 'completed-zero', yieldReduction: '0' }),
        Object.freeze({ ...withoutReduction, id: 'completed-without-reduction' }),
        Object.freeze({ ...mockReservationRecords[0] }),
    ])
    const fixtureSnapshot = structuredClone(fixture)
    const records = getMockReservationRecords('completed', fixture)

    assert.equal(records.length, 2)
    assert.equal(records.find((record) => record.id === 'completed-zero').yieldReduction, '0')
    assert.equal(Object.hasOwn(records.find((record) => record.id === 'completed-without-reduction'), 'yieldReduction'), false)
    assert.deepEqual(fixture, fixtureSnapshot)
})
