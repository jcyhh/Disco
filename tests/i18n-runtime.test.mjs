import test, { after } from 'node:test'
import assert from 'node:assert/strict'

import { APP_LANGUAGES, DEFAULT_LANGUAGE_CODE, FALLBACK_LANGUAGE_CODE } from '../src/i18n/config.ts'
import { appI18n } from '../src/i18n/instance.ts'
import { translate } from '../src/i18n/translate.ts'
import { formatRelativeTime } from '../src/shared/formatters/formatRelativeTime.ts'
import { installJsonImports } from './helpers/json-imports.mjs'

const jsonImports = installJsonImports()
after(() => jsonImports.deregister())

test('translation safely falls back before initialization and for unknown keys', async () => {
    assert.equal(translate('unregistered.key'), 'unregistered.key')
    const resources = Object.fromEntries(await Promise.all(APP_LANGUAGES.map(async (language) => [
        language.code,
        { translation: await language.load() },
    ])))
    const selectedLanguage = APP_LANGUAGES.find(({ code }) => code === DEFAULT_LANGUAGE_CODE) ?? APP_LANGUAGES[0]
    await appI18n.init({ lng: selectedLanguage.code, fallbackLng: FALLBACK_LANGUAGE_CODE, resources, keySeparator: false })
    try {
        assert.equal(translate('http.requestFailed'), resources[selectedLanguage.code].translation['http.requestFailed'])
        assert.equal(translate('unregistered.key'), 'unregistered.key')
        const now = new Date(2026, 6, 13, 12)
        assert.equal(formatRelativeTime(new Date(2026, 6, 12, 8, 5), now), `${translate('昨天')} 08:05`)
        const nextLanguage = APP_LANGUAGES.find(({ code }) => code !== selectedLanguage.code) ?? selectedLanguage
        await appI18n.changeLanguage(nextLanguage.code)
        assert.equal(translate('auth.tokenUnavailable'), resources[nextLanguage.code].translation['auth.tokenUnavailable'])
    } finally {
        appI18n.isInitialized = false
    }
})
