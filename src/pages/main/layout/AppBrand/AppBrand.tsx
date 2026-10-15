import { useLocation } from 'react-router'

import { APP_CONFIG } from '@/config'
import { ROUTE_PATH, useAppNavigate } from '@/router'

import './AppBrand.scss'

type AppBrandProps = {
    className?: string
    showName?: boolean
    logoVariant?: 'square' | 'wordmark'
    onClick?: () => void
}

export function AppBrand({
    className = '',
    showName = true,
    logoVariant = 'square',
    onClick,
}: AppBrandProps) {
    const location = useLocation()
    const { pushRoute } = useAppNavigate()
    const brandClassName = [
        'app-brand',
        'flex',
        'items-center',
        logoVariant === 'wordmark' && 'app-brand--wordmark',
        className,
    ].filter(Boolean).join(' ')
    const logoPath = logoVariant === 'wordmark'
        ? 'brand/disco-wordmark.png'
        : 'brand/app-logo.png'

    function handleBrandClick() {
        if (location.pathname !== ROUTE_PATH.home) {
            pushRoute(ROUTE_PATH.home)
        }

        onClick?.()
    }

    return (
        <div className={brandClassName} onClick={handleBrandClick}>
            <img
                src={`${APP_CONFIG.routeBase}${logoPath}`}
                className="app-brand__logo"
                alt={APP_CONFIG.name}
            />
            {showName ? (
                <div className="ml-10 size-24 bold-6">
                    {APP_CONFIG.name}
                </div>
            ) : null}
        </div>
    )
}
