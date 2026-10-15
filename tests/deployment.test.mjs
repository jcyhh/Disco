import assert from 'node:assert/strict'
import test from 'node:test'
import { APP_DEPLOYMENT, getRouterBasename, normalizeRouteBase } from '../src/config/deployment.ts'
import { APP_CONFIG } from '../src/config/app.ts'
import { APP_ROUTE_BASE, APP_ROUTER_BASENAME } from '../src/router/config.ts'

for (const [input, expected] of [['/', '/'], ['', '/'], ['mobile/app', '/mobile/app/'], [' /mobile//app/ ', '/mobile/app/']]) {
    test(`normalizes deployment path ${JSON.stringify(input)}`, () => {
        assert.equal(normalizeRouteBase(input), expected)
        assert.equal(getRouterBasename(input), expected === '/' ? '' : expected.slice(0, -1))
    })
}

test('app and router consume the shared deployment configuration', () => {
    assert.equal(APP_CONFIG.routeBase, APP_DEPLOYMENT.routeBase)
    assert.equal(APP_ROUTE_BASE, APP_DEPLOYMENT.routeBase)
    assert.equal(APP_ROUTER_BASENAME, getRouterBasename(APP_DEPLOYMENT.routeBase))
})
