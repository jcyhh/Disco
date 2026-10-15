import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('button structures consume the project skin and optional skins compose with either structure', async () => {
    const [mixins, utilities, tokens] = await Promise.all([
        readFile('src/styles/mixins.scss', 'utf8'),
        readFile('src/styles/common/common.scss', 'utf8'),
        readFile('src/styles/color.scss', 'utf8'),
    ])
    for (const structure of ['full-button', 'auto-button']) {
        const parameters = mixins.match(new RegExp(`@mixin ${structure}\\(([\\s\\S]*?)\\)\\s*\\{`))?.[1]
        assert.match(parameters ?? '', /\$bg:\s*var\(--app-btn-bg\)/)
    }
    assert.match(tokens, /--app-btn-bg:/)
    for (const skin of ['solid', 'gradient', 'gradient-border']) {
        assert.match(utilities, new RegExp(`\\.btn-${skin}\\s*\\{`))
    }
    assert.match(utilities, /\.full-btn\s*\{\s*@include full-button/)
    assert.match(utilities, /\.auto-btn\s*\{\s*@include auto-button/)
})
