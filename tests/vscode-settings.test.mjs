import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

test('optional editor settings are valid JSON when provided', () => {
    for (const path of ['.vscode/settings.json', '.vscode/extensions.json']) {
        if (existsSync(path)) assert.doesNotThrow(() => JSON.parse(readFileSync(path, 'utf8')))
    }
})
