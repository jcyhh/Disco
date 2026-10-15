import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { APP_ROUTER_BASENAME } from '../src/router/config.ts'
import { addAppBasenameToPathname, stripAppBasenameFromLocation, stripAppBasenameFromPathname } from '../src/router/appBrowserHistory.ts'

for (const base of ['', '/h5', '/custom/mobile', APP_ROUTER_BASENAME]) {
    test(`history accepts optional prefixes and preserves location for base ${base || '/'}`, () => {
        for (const path of ['/', '/home', '/ref/abc']) {
            const prefixed = `${base}${path}`
            assert.equal(stripAppBasenameFromPathname(prefixed, base), path)
            assert.equal(addAppBasenameToPathname(path, base), prefixed)
            assert.equal(addAppBasenameToPathname(prefixed, base), prefixed)
        }
        const location = { pathname: `${base}/ref/abc`, search: '?from=invite', hash: '#top', state: { source: 'test' }, key: 'test' }
        assert.deepEqual(stripAppBasenameFromLocation(location, base), { ...location, pathname: '/ref/abc' })
        if (base) assert.equal(stripAppBasenameFromPathname(`${base}-other/home`, base), `${base}-other/home`)
    })
}

test('router uses AppBrowserRouter instead of strict BrowserRouter basename', async () => {
    const [router, appBrowserRouter, routerReadme] = await Promise.all([
        readFile('src/router/AppRouter.tsx', 'utf8'),
        readFile('src/router/AppBrowserRouter.tsx', 'utf8'),
        readFile('src/router/README.md', 'utf8'),
    ])

    assert.match(router, /<AppBrowserRouter>/)
    assert.doesNotMatch(router, /BrowserRouter basename/)
    assert.match(appBrowserRouter, /unstable_HistoryRouter/)
    assert.match(appBrowserRouter, /createAppBrowserHistory/)
    assert.match(routerReadme, /AppBrowserRouter/)
    assert.match(routerReadme, /without the `\/h5` prefix/)
})
