import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
    APP_LANGUAGES,
    DEFAULT_LANGUAGE_CODE,
    FALLBACK_LANGUAGE_CODE,
    FIXED_LANGUAGE_CODE,
    mergeLanguageMessages,
    findAppLanguage,
} from '../src/i18n/config.ts'
import { APP_CONFIG } from '../src/config/app.ts'
import { getRequestLanguage } from '../src/i18n/getRequestLanguage.ts'
import { installJsonImports } from './helpers/json-imports.mjs'

const jsonImports = installJsonImports()
after(() => jsonImports.deregister())

function createStorage(language = '') {
    const cache = new Map(language ? [['LANG', language]] : [])
    return {
        getItem: (key) => cache.get(key) ?? null,
        setItem: (key, value) => cache.set(key, value),
        removeItem: (key) => cache.delete(key),
    }
}

test('enabled languages have unique standard codes and include every fallback', () => {
    const codes = APP_LANGUAGES.map(({ code }) => code)
    assert.ok(codes.length > 0)
    assert.equal(new Set(codes).size, codes.length)
    for (const { code, name, load } of APP_LANGUAGES) {
        assert.doesNotThrow(() => new Intl.Locale(code))
        assert.ok(name.trim())
        assert.equal(typeof load, 'function')
        assert.equal(findAppLanguage(code)?.code, code)
    }
    assert.ok(codes.includes(DEFAULT_LANGUAGE_CODE))
    if (APP_CONFIG.enableI18n) assert.ok(codes.includes(FALLBACK_LANGUAGE_CODE))
    assert.ok(codes.includes(FIXED_LANGUAGE_CODE))
    assert.equal(findAppLanguage('unsupported'), undefined)
})

test('all enabled common locales translate the splash welcome template', async () => {
    const messages = await Promise.all(
        APP_LANGUAGES.map(async ({ code }) => JSON.parse(
            await readFile(`src/i18n/locales/common/${code}.json`, 'utf8'),
        )),
    )

    assert.equal(
        messages.every((message) => typeof message['欢迎来到{{name}}'] === 'string'),
        true,
    )
})

test('request language follows the enabled language configuration and safely falls back', () => {
    for (const language of APP_LANGUAGES) {
        globalThis.window = { localStorage: createStorage(language.code) }
        assert.equal(getRequestLanguage(), APP_CONFIG.enableI18n ? language.code : FIXED_LANGUAGE_CODE)
    }
    globalThis.window = { localStorage: createStorage('unsupported') }
    assert.equal(getRequestLanguage(), DEFAULT_LANGUAGE_CODE)
})

test('forces simplified Chinese when i18n is disabled', () => {
    const previousEnableI18n = APP_CONFIG.enableI18n
    APP_CONFIG.enableI18n = false

    try {
        globalThis.window = { localStorage: createStorage('ms') }
        assert.equal(getRequestLanguage(), 'zh-Hans')
    } finally {
        APP_CONFIG.enableI18n = previousEnableI18n
    }
})

test('i18n initializes and changes the app store language from storage', async () => {
    const [changeSource, initializeSource, storeSource] = await Promise.all([
        readFile('src/i18n/changeAppLanguage.ts', 'utf8'),
        readFile('src/i18n/initializeI18n.ts', 'utf8'),
        readFile('src/stores/app/store.ts', 'utf8'),
    ])

    assert.match(storeSource, /languageCode/)
    assert.match(storeSource, /getLanguage\(\)/)
    assert.match(changeSource, /useAppStore/)
    assert.match(changeSource, /APP_CONFIG\.enableI18n/)
    assert.match(changeSource, /setLanguageCode\(language\.code\)/)
    assert.match(initializeSource, /useAppStore/)
    assert.match(initializeSource, /APP_CONFIG\.enableI18n/)
    assert.match(initializeSource, /setLanguageCode\(selectedLanguage\.code\)/)
})

test('language loaders combine common, DApp and project copy', async () => {
    for (const language of APP_LANGUAGES) {
        const messages = await language.load()
        assert.equal(typeof messages['欢迎来到{{name}}'], 'string')
        assert.equal(typeof messages['auth.tokenUnavailable'], 'string')
        assert.equal(typeof messages['dapp.invalidAmount'], 'string')
        assert.equal(typeof messages['暂无数据'], 'string')
    }
    assert.deepEqual(mergeLanguageMessages({ shared: 'common' }, { wallet: 'wallet' }, { shared: 'project' }), {
        shared: 'project', wallet: 'wallet',
    })
})
