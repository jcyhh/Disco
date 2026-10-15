import test from 'node:test'
import assert from 'node:assert/strict'

import {
    buildRouteHref,
    buildRoutePath,
    createRouteNavigator,
} from '../src/router/navigation.ts'
import { APP_CONFIG } from '../src/config/app.ts'
import { APP_ROUTE_BASE } from '../src/router/config.ts'
import { ROUTE_PATH } from '../src/router/routes.ts'

test('builds internal route paths with query and hash', () => {
    assert.equal(
        buildRoutePath(ROUTE_PATH.home, {
            query: {
                page: 2,
                keyword: 'wallet',
                empty: '',
                disabled: false,
                skipped: null,
                tags: ['dapp', 'h5'],
            },
            hash: 'list',
        }),
        `${ROUTE_PATH.home}?page=2&keyword=wallet&empty=&disabled=false&tags=dapp&tags=h5#list`,
    )
})

test('preserves and merges object route search params', () => {
    assert.deepEqual(
        buildRoutePath(
            { pathname: ROUTE_PATH.user, search: '?from=home', hash: '#old' },
            { query: { tab: 'assets' }, hash: 'top' },
        ),
        {
            pathname: ROUTE_PATH.user,
            search: '?from=home&tab=assets',
            hash: '#top',
        },
    )
})

test('builds hrefs with the configured h5 base path', () => {
    assert.equal(buildRouteHref(ROUTE_PATH.home), `${APP_ROUTE_BASE}${APP_CONFIG.homeRouteName}`)
    assert.equal(
        buildRouteHref(ROUTE_PATH.root, { query: { invite: 'abc' } }),
        `${APP_ROUTE_BASE}?invite=abc`,
    )
})

test('wraps router navigation into project-friendly helpers', () => {
    const calls = []
    const navigate = (...args) => {
        calls.push(args)
    }
    const router = createRouteNavigator(navigate)

    router.pushRoute(ROUTE_PATH.home, { state: { from: 'test' } })
    router.replaceRoute(ROUTE_PATH.user, { query: { tab: 1 } })
    router.backRoute()
    router.forwardRoute(2)
    router.goRoute(-3)

    assert.deepEqual(calls, [
        [ROUTE_PATH.home, { state: { from: 'test' } }],
        ['/user?tab=1', { replace: true }],
        [-1],
        [2],
        [-3],
    ])
})
