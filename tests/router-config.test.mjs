import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'

import {
    APP_ROUTE_BASE,
    APP_ROUTER_BASENAME,
    DEFAULT_LAYOUT_MENU_TYPE,
    LAYOUT_MENU_TYPE,
    LAYOUT_MENU_TYPE_OPTIONS,
} from '../src/router/config.ts'
import { APP_CONFIG } from '../src/config/app.ts'
import { APP_DEPLOYMENT, getRouterBasename } from '../src/config/deployment.ts'
import { ROUTE_PATH } from '../src/router/routes.ts'

const menuModule = await build({
    entryPoints: [new URL('../src/pages/main/config.ts', import.meta.url).pathname],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
    tsconfig: new URL('../tsconfig.app.json', import.meta.url).pathname,
    loader: { '.png': 'dataurl' },
    logLevel: 'silent',
})
const { MAIN_PAGE_ITEMS } = await import(
    `data:text/javascript;base64,${Buffer.from(menuModule.outputFiles[0].text).toString('base64')}`
)

test('router uses the configured deployment path for history mode', () => {
    assert.equal(APP_ROUTE_BASE, APP_DEPLOYMENT.routeBase)
    assert.equal(APP_ROUTER_BASENAME, getRouterBasename(APP_DEPLOYMENT.routeBase))
})

test('vite and the app share the deployment path', async () => {
    const source = await readFile(
        new URL('../vite.config.ts', import.meta.url),
        'utf8',
    )

    assert.match(source, /base:\s*APP_DEPLOYMENT\.routeBase/)
})

test('router derives the home path from the project-level home route name', async () => {
    const [routesSource, routerConfigSource] = await Promise.all([
        readFile(new URL('../src/router/routes.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/router/config.ts', import.meta.url), 'utf8'),
    ])

    assert.equal(ROUTE_PATH.home, `/${APP_CONFIG.homeRouteName}`)
    assert.match(routerConfigSource, /export const APP_HOME_ROUTE_NAME\s*=\s*APP_CONFIG\.homeRouteName/)
    assert.match(routesSource, /home:\s*`\/\$\{APP_HOME_ROUTE_NAME\}`/)
    assert.doesNotMatch(routesSource, /home:\s*'\/home'/)
})

test('layout exposes the supported menu modes for templates', () => {
    assert.deepEqual(LAYOUT_MENU_TYPE, {
        tabbar: 'tabbar',
        sidebar: 'sidebar',
    })
    assert.deepEqual(LAYOUT_MENU_TYPE_OPTIONS, ['tabbar', 'sidebar'])
    assert.equal(DEFAULT_LAYOUT_MENU_TYPE, APP_CONFIG.defaultLayoutMenuType)
})

test('route records expose business pages and retain the existing user route', () => {
    assert.equal(ROUTE_PATH.root, '/')
    assert.equal(ROUTE_PATH.referral, '/ref/:ref')
    assert.equal(ROUTE_PATH.home, `/${APP_CONFIG.homeRouteName}`)
    assert.equal(ROUTE_PATH.reservation, '/reservation')
    assert.equal(ROUTE_PATH.purchaseCard, '/purchase-card')
    assert.equal(ROUTE_PATH.activationCard, '/activation-card')
    assert.equal(ROUTE_PATH.asset, '/asset')
    assert.equal(ROUTE_PATH.team, '/team')
    assert.equal(ROUTE_PATH.invite, '/invite')
    assert.equal(ROUTE_PATH.user, '/user')
})

test('main menu exposes the seven requested destinations without duplicate or invalid routes', () => {
    assert.deepEqual(MAIN_PAGE_ITEMS.map(({ path, title }) => ({ path, title })), [
        { path: ROUTE_PATH.home, title: '首页' },
        { path: ROUTE_PATH.reservation, title: '预约记录' },
        { path: ROUTE_PATH.purchaseCard, title: '购买激活卡' },
        { path: ROUTE_PATH.activationCard, title: '我的激活卡' },
        { path: ROUTE_PATH.asset, title: '我的资产' },
        { path: ROUTE_PATH.team, title: '团队' },
        { path: ROUTE_PATH.invite, title: '邀请好友' },
    ])

    const validRoutes = new Set(Object.values(ROUTE_PATH))
    assert.equal(new Set(MAIN_PAGE_ITEMS.map(({ path }) => path)).size, MAIN_PAGE_ITEMS.length)
    assert.equal(MAIN_PAGE_ITEMS.some(({ path }) => path === ROUTE_PATH.user), false)

    for (const item of MAIN_PAGE_ITEMS) {
        assert.equal(validRoutes.has(item.path), true, `Unknown menu route: ${item.path}`)
        assert.equal(typeof item.icon, 'string')
        assert.equal(typeof item.activeIcon, 'string')
        assert.ok(item.icon.length > 0)
        assert.ok(item.activeIcon.length > 0)
    }
})

test('main page exports and router register every menu destination in its page module', async () => {
    const [routerSource, exportsSource] = await Promise.all([
        readFile(new URL('../src/router/AppRouter.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/pages/main/index.ts', import.meta.url), 'utf8'),
    ])
    const pageModules = [
        ['home', 'HomePage', 'home'],
        ['reservation', 'ReservationPage', 'reservation'],
        ['purchaseCard', 'PurchaseCardPage', 'purchase-card'],
        ['activationCard', 'ActivationCardPage', 'activation-card'],
        ['asset', 'AssetPage', 'asset'],
        ['team', 'TeamPage', 'team'],
        ['invite', 'InvitePage', 'invite'],
        ['user', 'UserPage', 'user'],
    ]

    for (const [routeName, component, directory] of pageModules) {
        assert.match(routerSource, new RegExp(`<Route\\s+path=\\{ROUTE_PATH\\.${routeName}\\.slice\\(1\\)\\}\\s+element=\\{<${component}\\s*/>\\}\\s*/>`))
        assert.match(exportsSource, new RegExp(`export \\{ ${component} \\} from '\\./${directory}/index\\.ts'`))
    }
})

test('app retains normal entry routes and allows static development to enter home directly', async () => {
    const source = await readFile(
        new URL('../src/router/AppRouter.tsx', import.meta.url),
        'utf8',
    )

    assert.match(source, /import \{ SplashPage \}/)
    assert.match(source, /import \{[\s\S]*\bHomePage\b[\s\S]*\} from '@\/pages\/main'/)
    assert.match(source, /<Route path=\{ROUTE_PATH\.root\} element=\{APP_CONFIG\.enableStaticPageMode \? <Navigate to=\{ROUTE_PATH\.home\} replace \/> : <SplashPage \/>\} \/>/)
    assert.match(source, /<Route path=\{ROUTE_PATH\.referral\} element=\{<SplashPage \/>\} \/>/)
    assert.match(source, /<Route element=\{<MainLayout \/>\}>/)
    assert.match(source, /<Route path="\*" element=\{<Navigate to=\{ROUTE_PATH\.root\} replace \/>\} \/>/)
})
