import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

test('brand status records the current project readiness without fixing its value', () => {
    const status = JSON.parse(readFileSync('public/brand/brand-status.json', 'utf8'))
    assert.equal(typeof status.isProjectLogoReady, 'boolean')
    const result = spawnSync(process.execPath, ['scripts/verify-brand-assets.mjs'], { encoding: 'utf8' })
    assert.equal(result.status === 0, status.isProjectLogoReady)
})

for (const ready of [false, true]) {
    test(`brand guard ${ready ? 'allows initialized' : 'blocks placeholder'} project assets`, () => {
        const directory = mkdtempSync(join(tmpdir(), 'brand-assets-'))
        try {
            const statusPath = join(directory, 'brand-status.json')
            writeFileSync(statusPath, JSON.stringify({ isProjectLogoReady: ready }))
            const result = spawnSync(process.execPath, ['scripts/verify-brand-assets.mjs', '--status', statusPath], { encoding: 'utf8' })
            assert.equal(result.status === 0, ready)
            if (!ready) {
                assert.match(result.stderr, /project logo/i)
                assert.match(result.stderr, /pnpm favicon:generate/)
            }
        } finally { rmSync(directory, { recursive: true, force: true }) }
    })
}
