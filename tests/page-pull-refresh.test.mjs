import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('page pull refresh exposes a page-level refresh registration contract', async () => {
    const [component, context, style, entry, readme] = await Promise.all([
        readFile('src/components/PagePullRefresh/PagePullRefresh.tsx', 'utf8'),
        readFile('src/components/PagePullRefresh/context.ts', 'utf8'),
        readFile('src/components/PagePullRefresh/PagePullRefresh.scss', 'utf8'),
        readFile('src/components/PagePullRefresh/index.ts', 'utf8'),
        readFile('src/components/PagePullRefresh/README.md', 'utf8'),
    ])

    assert.match(component, /export function PagePullRefresh/)
    assert.match(component, /children:\s*ReactNode/)
    assert.match(component, /enabled\?: boolean/)
    assert.match(component, /refreshHandlerRef/)
    assert.match(component, /await refreshHandler\(\)/)
    assert.match(component, /isRefreshingRef/)
    assert.match(component, /onTouchStart/)
    assert.match(component, /onTouchMove/)
    assert.match(component, /onTouchEnd/)
    assert.match(component, /Icon name="refresh"/)

    assert.match(context, /export type PageRefreshHandler = \(\) => Promise<void> \| void/)
    assert.match(context, /export function usePageRefresh/)
    assert.match(context, /registerPageRefresh\(onRefresh\)/)

    assert.match(style, /\.page-pull-refresh\s*\{/)
    assert.match(style, /min-height:\s*100vh/)
    assert.match(style, /min-height:\s*100dvh/)
    assert.match(style, /overscroll-behavior-y:\s*contain/)

    assert.match(entry, /export \{ PagePullRefresh \} from '\.\/PagePullRefresh\.tsx'/)
    assert.match(entry, /export \{ usePageRefresh \} from '\.\/context\.ts'/)
    assert.match(readme, /Promise<void>/)
    assert.match(readme, /usePageRefresh\(refreshPageData/)
})

test('authenticated business routes are wrapped by page pull refresh', async () => {
    const router = await readFile('src/router/AppRouter.tsx', 'utf8')

    assert.match(router, /import \{ PagePullRefresh \} from '@\/components\/PagePullRefresh'/)
    assert.match(router, /function PullRefreshRouteOutlet\(\)/)
    assert.match(router, /<PagePullRefresh>[\s\S]*<Outlet \/>[\s\S]*<\/PagePullRefresh>/)
    assert.match(
        router,
        /<Route element=\{<RequireAuthentication \/>\}>[\s\S]*<Route element=\{<PullRefreshRouteOutlet \/>\}>[\s\S]*<Route element=\{<MainLayout \/>\}>/,
    )
    assert.doesNotMatch(router, /<Route path=\{ROUTE_PATH\.root\} element=\{<PagePullRefresh>/)
    assert.doesNotMatch(router, /<Route path=\{ROUTE_PATH\.login\} element=\{<PagePullRefresh>/)
})
