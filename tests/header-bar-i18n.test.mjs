import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('header bar keeps the language switch and masks the signed-in wallet address', async () => {
    const component = await readFile('src/pages/main/layout/HeaderBar/HeaderBar.tsx', 'utf8')

    assert.match(component, /APP_CONFIG/)
    assert.match(component, /APP_LOGIN_MODE/)
    assert.match(component, /import \{ LanguageSwitch \} from '@\/components\/LanguageSwitch'/)
    assert.doesNotMatch(component, /headerLangUrl/)
    assert.match(component, /<LanguageSwitch\b/)
    assert.match(component, /useDappStore/)
    assert.match(component, /useUserStore/)
    assert.match(component, /maskWalletAddress/)
    assert.match(
        component,
        /APP_CONFIG\.loginMode !== APP_LOGIN_MODE\.account/,
    )
    assert.match(component, /isAuthenticated\s*&&\s*walletAddress/)
    assert.match(component, /showWalletAddress \? maskWalletAddress\(walletAddress\)/)
    assert.match(component, /const showStaticLogin =[\s\S]*?isAuthenticated\s*&&\s*APP_CONFIG\.enableStaticPageMode/)
    assert.match(component, /showWalletAddress \|\| showStaticLogin \? \(/)
    assert.match(component, /t\('已登录'\)/)
    assert.doesNotMatch(component, /t\('链接'\)/)
})

test('header bar renders its gap by default and allows hiding it', async () => {
    const component = await readFile('src/pages/main/layout/HeaderBar/HeaderBar.tsx', 'utf8')

    assert.match(component, /type HeaderBarProps/)
    assert.match(component, /showGap\?: boolean/)
    assert.match(component, /showGap = true/)
    assert.match(component, /showGap \? <div className="app-header-bar__gap" \/> : null/)
})

test('header menu icon only renders in sidebar layout mode', async () => {
    const component = await readFile('src/pages/main/layout/HeaderBar/HeaderBar.tsx', 'utf8')
    const layout = await readFile('src/pages/main/layout/MainLayout.tsx', 'utf8')

    assert.match(component, /showSidebarMenu\?: boolean/)
    assert.match(component, /onSidebarMenuClick\?: \(\) => void/)
    assert.match(component, /showSidebarMenu = false/)
    assert.match(component, /showSidebarMenu \? \(/)
    assert.match(component, /src=\{headerMenuUrl\}/)
    assert.match(component, /onClick=\{onSidebarMenuClick\}/)
    assert.match(component, /alt="Menu"/)
    assert.match(layout, /<HeaderBar/)
    assert.match(layout, /showSidebarMenu=\{isSidebarLayout\}/)
    assert.match(layout, /onSidebarMenuClick=\{handleOpenSidebarMenu\}/)
})
