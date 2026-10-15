import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

import { getReferralCode, removeReferralCode } from '../src/services/storage/index.ts'
import { saveSplashReferralCode } from '../src/pages/splash/referral.ts'

function createStorage() {
    const cache = new Map()
    return {
        cache,
        getItem: (key) => cache.get(key) ?? null,
        setItem: (key, value) => cache.set(key, value),
        removeItem: (key) => cache.delete(key),
    }
}

test('splash page stores referral code from the route param', () => {
    globalThis.window = { localStorage: createStorage() }
    removeReferralCode()

    assert.equal(saveSplashReferralCode(' abc123 '), true)
    assert.equal(getReferralCode(), 'abc123')
})

test('splash page ignores empty referral code values', () => {
    globalThis.window = { localStorage: createStorage() }
    removeReferralCode()

    assert.equal(saveSplashReferralCode('   '), false)
    assert.equal(saveSplashReferralCode(undefined), false)
    assert.equal(getReferralCode(), '')
})

test('splash route reuses the same page and clears referral URL after caching', async () => {
    const source = await readFile(
        new URL('../src/pages/splash/SplashPage.tsx', import.meta.url),
        'utf8',
    )

    assert.match(source, /useParams/)
    assert.match(source, /saveSplashReferralCode\(ref\)/)
    assert.match(source, /navigate\(ROUTE_PATH\.root,\s*\{\s*replace:\s*true\s*\}\)/)
})

test('splash page translates welcome copy and reuses the shared loading icon', async () => {
    const source = await readFile(
        new URL('../src/pages/splash/SplashPage.tsx', import.meta.url),
        'utf8',
    )

    assert.match(source, /APP_CONFIG\.routeBase/)
    assert.match(source, /brand\/app-logo\.png/)
    assert.match(source, /APP_CONFIG\.name/)
    assert.match(source, /t\('欢迎来到\{\{name\}\}', \{ name: APP_CONFIG\.name \}\)/)
    assert.match(source, /useTranslation/)
    assert.match(source, /欢迎来到\{\{name\}\}/)
    assert.match(source, /<Icon[\s\S]*name="loading"/)
    assert.match(source, /name="loading"[\s\S]*className="size-\d+"/)
    assert.match(source, /loading \? \(/)
    assert.match(source, /AUTH_STARTUP_RESULT\.walletRequired/)
    assert.match(source, /animate__zoomIn/)
    assert.match(source, /animate__slideInUp/)
})

test('splash page uses the shared public brand logo', async () => {
    await assert.doesNotReject(() => access('public/brand/app-logo.png'))
})

test('splash page style keeps the centered brand and bottom tips without background image', async () => {
    const source = await readFile(
        new URL('../src/pages/splash/SplashPage.scss', import.meta.url),
        'utf8',
    )

    assert.match(source, /&__brand/)
    assert.match(source, /inset:\s*0/)
    assert.match(source, /bottom:\s*30px/)
    assert.doesNotMatch(source, /background-image/)
})
