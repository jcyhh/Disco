import assert from 'node:assert/strict'
import test from 'node:test'
import { assertNotAborted } from '../src/shared/async/assertNotAborted.ts'

test('checks cancellation on WebViews without throwIfAborted or reason', () => {
    const signal = { aborted: false }
    assert.doesNotThrow(() => assertNotAborted(signal))

    signal.aborted = true
    assert.throws(() => assertNotAborted(signal), { name: 'AbortError' })
})
