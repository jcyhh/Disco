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
import { AUTH_STARTUP_STAGE } from '@/features/auth/config.ts'
import {
    startAuthFlow,
    type AuthStartupResult,
} from '@/features/auth/startup.ts'
import { ROUTE_PATH } from '@/router/routes.ts'

import { waitForSplashAnimation } from './animation.ts'
import { saveSplashReferralCode } from './referral.ts'
import './SplashPage.scss'

type SplashRouteParams = {
    ref?: string
}

const startupStages = {
    [AUTH_STARTUP_STAGE.walletDetection]: '钱包检测',
    [AUTH_STARTUP_STAGE.walletNetwork]: '钱包网络',
    [AUTH_STARTUP_STAGE.walletConnection]: '钱包连接',
    [AUTH_STARTUP_STAGE.walletSignature]: '登录签名',
    [AUTH_STARTUP_STAGE.loginService]: '登录接口',
    [AUTH_STARTUP_STAGE.session]: '登录会话',
} as const

export function SplashPage() {
    const { t } = useTranslation()
    const { ref } = useParams<SplashRouteParams>()
    const navigate = useNavigate()
    const [startupResult, setStartupResult] = useState<AuthStartupResult>()
    const [attempt, setAttempt] = useState(0)
    const failure = typeof startupResult === 'object' ? startupResult : undefined
    const failureMessage = failure && (failure.responseMessage ?? t(failure.messageKey))
    const loading = APP_CONFIG.loginMode !== APP_LOGIN_MODE.account && !startupResult

    useEffect(() => {
        if (saveSplashReferralCode(ref)) {
            void navigate(ROUTE_PATH.root, { replace: true })
            return
        }

    }, [navigate, ref])

    useEffect(() => {
        if (ref) return
        const controller = new AbortController()

        async function startSplashAuthFlow(): Promise<void> {
            await waitForSplashAnimation()
            if (controller.signal.aborted) return
            const result = await startAuthFlow(controller.signal)
            if (!controller.signal.aborted) setStartupResult(result)
        }

        void startSplashAuthFlow()
        return () => controller.abort()
    }, [attempt, ref])

    function retryStartup() {
        setStartupResult(undefined)
        setAttempt((current) => current + 1)
    }

    return (
        <section className="splash-page" data-page="splash">
            <div className="splash-page__brand flex flex-column items-center justify-center animate__animated animate__zoomIn ani-delay-3">
                <img
                    src={splashLogoUrl}
                    className="splash-page__logo"
                    alt={APP_CONFIG.name}
                />
            </div>

            <div className="splash-page__tips vw-100 flex-center flex-column gap-10 size-20 tc animate__animated animate__slideInUp ani-delay-3">
                <div className="flex-center gap-10 pl-24 pr-24" role="status">
                    {failure ? (
                        <span className="splash-page__failure">
                            {t(startupStages[failure.stage])} · {failureMessage}
                            {' '}({failure.stage}{failure.httpStatus ? ` / HTTP ${failure.httpStatus}` : ''})
                        </span>
                    ) : <span>{t('欢迎来到{{name}}', { name: APP_CONFIG.name })}</span>}
                    {loading ? (
                        <Icon
                            name="loading"
                            className="size-15"
                            ariaLabel={t('加载中')}
                        />
                    ) : null}
                </div>
                {failure ? (
                    <button type="button" className="auto-btn" onClick={retryStartup}>{t('点击重试')}</button>
                ) : null}
            </div>
        </section>
    )
}
