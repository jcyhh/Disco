import { useTranslation } from 'react-i18next'

import walletIconUrl from '@/assets/common/button-icon.svg'
import headerMenuUrl from '@/assets/layout/headbar/menu.svg'

import { LanguageSwitch } from '@/components/LanguageSwitch'
import { APP_CONFIG, APP_LOGIN_MODE } from '@/config/index.ts'
import { maskWalletAddress } from '@/shared/formatters/maskWalletAddress.ts'
import { useDappStore } from '@/stores/dapp/index.ts'
import { useUserStore } from '@/stores/user/index.ts'

import { AppBrand } from '../AppBrand/AppBrand.tsx'

import './HeaderBar.scss'

type HeaderBarProps = {
    showGap?: boolean
    showSidebarMenu?: boolean
    onSidebarMenuClick?: () => void
}

export function HeaderBar({
    showGap = true,
    showSidebarMenu = false,
    onSidebarMenuClick,
}: HeaderBarProps) {
    const { t } = useTranslation()
    const walletAddress = useDappStore((state) => state.walletAddress)
    const isAuthenticated = useUserStore((state) => state.isAuthenticated)
    const showWalletAddress =
        APP_CONFIG.loginMode !== APP_LOGIN_MODE.account &&
        isAuthenticated &&
        walletAddress
    const showStaticLogin =
        APP_CONFIG.loginMode !== APP_LOGIN_MODE.account &&
        isAuthenticated &&
        APP_CONFIG.enableStaticPageMode

    return (
        <header>
            <div className="app-header-bar vw-100 backdrop">
                {/* 顶部安全区域占位 */}
                <div className="safe-top" />
                {/* 导航栏 */}
                <div className="flex justify-between items-center header">
                    {/* 左侧 */}
                    <div className="flex flex-none items-center">
                        {showSidebarMenu ? (
                            <button
                                type="button"
                                className="app-header-bar__menu flex-none mr-20"
                                aria-label="Menu"
                                onClick={onSidebarMenuClick}
                            >
                                <img src={headerMenuUrl} className="img-40" alt="Menu" />
                            </button>
                        ) : null}
                        <AppBrand showName={false} logoVariant="wordmark" />
                    </div>
                    {/* 右侧 */}
                    <div className="flex flex-none items-center">
                        <LanguageSwitch />
                        {showWalletAddress || showStaticLogin ? (
                            <span className="app-header-bar__wallet flex-none ml-10">
                                <img src={walletIconUrl} className="img-32 flex-none" alt="" />
                                <span className="word-nowrap">
                                    {showWalletAddress ? maskWalletAddress(walletAddress) : t('已登录')}
                                </span>
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
            {showGap ? <div className="app-header-bar__gap" /> : null}
        </header>
    )
}
