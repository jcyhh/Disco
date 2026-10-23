import { usePageReveal } from '@/hooks/usePageReveal.ts'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usdtIconUrl } from '@/assets/tokens'
import expenseIconUrl from '@/assets/asset/expense.webp'
import heroBannerUrl from '@/assets/asset/hero-banner.webp'
import incomeIconUrl from '@/assets/asset/income.webp'
import withdrawIconUrl from '@/assets/asset/withdraw.svg'
import sectionStarUrl from '@/assets/common/section-star.png'
import { BusinessPageHero } from '@/components/BusinessPageHero'
import { ApiState, ApiListFooter } from '@/components/ApiState/ApiState.tsx'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { getCurrentUser, getBalanceLogs } from '@/features/user/api.ts'
import { getWithdrawConfig } from '@/features/withdraw/api.ts'
import { useApiResource } from '@/hooks/useApiResource.ts'
import { useApiList } from '@/hooks/useApiList.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'
import { WithdrawPopup } from './WithdrawPopup.tsx'

import './AssetPage.scss'

export function AssetPage() {
    const pageRef = usePageReveal<HTMLElement>()
    const { t } = useTranslation()
    const [showWithdrawal, setShowWithdrawal] = useState(false)
    const user = useApiResource(getCurrentUser)
    const config = useApiResource(getWithdrawConfig)
    const logs = useApiList(getBalanceLogs)
    const reloadUser = user.reload
    const reloadConfig = config.reload
    const reloadLogs = logs.reload
    const refresh = useCallback(async () => { await Promise.all([reloadUser(), reloadConfig(), reloadLogs()]) }, [reloadUser, reloadConfig, reloadLogs])
    usePageRefresh(refresh, !showWithdrawal)

    function closeWithdrawal() {
        setShowWithdrawal(false)
    }

    return (
        <section ref={pageRef} className="asset-page container pb-40" data-page="asset" aria-label={t('我的资产')}>
            <BusinessPageHero imageUrl={heroBannerUrl} title={t('我的资产')} subtitle={t('掌握资产动态')} />
            <ApiState loading={user.loading || config.loading} error={user.error || config.error} onRetry={refresh} />

            <section className="asset-page__overview app-card mt-30" data-reveal="rise" data-reveal-delay="1" aria-labelledby="asset-overview-title">
                <h2 id="asset-overview-title" className="black size-24 bold-7 lh-36">{t('资产预览')}</h2>
                <div className="asset-page__balance-row grid column-gap-20 mt-24">
                    <div className="asset-page__token">
                        <img src={usdtIconUrl} alt="" />
                    </div>
                    <div className="asset-page__balance-details flex items-end justify-between flex-wrap column-gap-16 row-gap-16">
                        <div className="asset-page__balance-copy">
                            <p className="size-28 bold-7 lh-42">USDT</p>
                            <p className="size-40 bold-7 lh-60 mt-4">{user.data ? formatAmount(user.data.usdt_balance) : '--'}</p>
                        </div>
                        <button type="button" className="asset-page__withdraw" disabled={!user.data || !config.data || user.error || config.error} onClick={() => setShowWithdrawal(true)}>
                            <img src={withdrawIconUrl} className="img-32 flex-none" alt="" />
                            {t('提取')}
                        </button>
                    </div>
                </div>
            </section>

            <section aria-labelledby="asset-history-title">
                <h2 id="asset-history-title" className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                    <img src={sectionStarUrl} className="section-star-motion img-40 flex-none" alt="" />
                    <span>{t('disco 资产明细')}</span>
                </h2>
                <ul className="grid grid-1 row-gap-20 mt-25">
                    {logs.items.map((record) => (
                        <li key={record.id} className="asset-page__record app-card grid column-gap-16 items-center" data-reveal="rise">
                            <div className={`asset-page__record-icon asset-page__record-icon--${record.is_inc === 1 ? 'income' : 'expense'}`}>
                                <img src={record.is_inc === 1 ? incomeIconUrl : expenseIconUrl} alt="" />
                            </div>
                            <div className="asset-page__record-note">
                                <p className="size-28 bold-5 lh-40">{record.content}</p>
                                <time className="asset-page__muted flex size-24 lh-34 mt-8" dateTime={record.created_at.replace(' ', 'T')}>
                                    {record.created_at}
                                </time>
                            </div>
                            <div className="tr">
                                <p className={`asset-page__amount asset-page__amount--${record.is_inc === 1 ? 'income' : 'expense'} size-28 bold-5 lh-40`}>{record.is_inc === 1 ? '+' : '−'}{formatAmount(record.amount)}</p>
                                <p className="asset-page__muted size-24 lh-34 mt-8">USDT</p>
                            </div>
                        </li>
                    ))}
                </ul>
                <ApiListFooter {...logs} />
            </section>

            <WithdrawPopup
                show={showWithdrawal}
                balance={user.data?.usdt_balance ?? '0'}
                address={user.data?.address ?? ''}
                config={config.data}
                onClose={closeWithdrawal}
                onSuccess={refresh}
            />
        </section>
    )
}
