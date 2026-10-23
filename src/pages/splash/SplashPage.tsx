import {
    useEffect,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
    useNavigate,
    useParams,
} from 'react-router'

import splashLogoUrl from '@/assets/splash/splash-logo.webp'
import { Icon } from '@/components/Icon'
import {
    APP_CONFIG,
    APP_LOGIN_MODE,
} from '@/config/index.ts'
import {
    AUTH_STARTUP_RESULT,
    startAuthFlow,
} from '@/features/auth/startup.ts'
import { ROUTE_PATH } from '@/router/routes.ts'

import { waitForSplashAnimation } from './animation.ts'
import { saveSplashReferralCode } from './referral.ts'
import './SplashPage.scss'

type SplashRouteParams = {
    ref?: string
}

export function SplashPage() {
    const { t } = useTranslation()
    const { ref } = useParams<SplashRouteParams>()
    const navigate = useNavigate()
    const [walletRequired, setWalletRequired] = useState(false)
    const loading = APP_CONFIG.loginMode !== APP_LOGIN_MODE.account && !walletRequired

    useEffect(() => {
        if (saveSplashReferralCode(ref)) {
            void navigate(ROUTE_PATH.root, { replace: true })
            return
        }

    }, [navigate, ref])

    useEffect(() => {
        if (ref) return
        let active = true

        async function startSplashAuthFlow(): Promise<void> {
            await waitForSplashAnimation()
            if (!active) return
            const result = await startAuthFlow()

            if (active && result === AUTH_STARTUP_RESULT.walletRequired) {
                setWalletRequired(true)
            }
        }

        void startSplashAuthFlow()
        return () => { active = false }
    }, [ref])

    return (
        <section className="splash-page" data-page="splash">
            <div className="splash-page__brand flex flex-column items-center justify-center animate__animated animate__zoomIn ani-delay-3">
                <img
                    src={splashLogoUrl}
                    className="splash-page__logo"
                    alt={APP_CONFIG.name}
                />
            </div>

            <div className="splash-page__tips vw-100 flex-center gap-10 size-20 tc animate__animated animate__slideInUp ani-delay-3">
                <span>
                    {walletRequired
                        ? t('请使用钱包环境打开！')
                        : t('欢迎来到{{name}}', { name: APP_CONFIG.name })}
                </span>

                {loading ? (
                    <Icon
                        name="loading"
                        className="size-15"
                        ariaLabel={t('加载中')}
                    />
                ) : null}
            </div>
        </section>
    )
}
