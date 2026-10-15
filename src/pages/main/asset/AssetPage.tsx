import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import discoTokenUrl from '@/assets/asset/disco-token.webp'
import expenseIconUrl from '@/assets/asset/expense.webp'
import heroBannerUrl from '@/assets/asset/hero-banner.webp'
import incomeIconUrl from '@/assets/asset/income.webp'
import withdrawIconUrl from '@/assets/asset/withdraw.svg'
import sectionStarUrl from '@/assets/common/section-star.png'
import { BusinessPageHero } from '@/components/BusinessPageHero'
import { ConfirmPopup } from '@/components/ConfirmPopup'
import { mockAssetOverview, mockAssetRecords } from '@/mock/asset.ts'

import './AssetPage.scss'

export function AssetPage() {
    const { t } = useTranslation()
    const [showWithdrawal, setShowWithdrawal] = useState(false)

    function closeWithdrawal() {
        setShowWithdrawal(false)
    }

    return (
        <section className="asset-page container pb-40" data-page="asset" aria-label={t('我的资产')}>
            <BusinessPageHero imageUrl={heroBannerUrl} title={t('我的资产')} subtitle={t('掌握资产动态')} />

            <section className="asset-page__overview app-card mt-30" aria-labelledby="asset-overview-title">
                <h2 id="asset-overview-title" className="black size-24 bold-7 lh-36">{t('资产预览')}</h2>
                <div className="asset-page__balance-row grid column-gap-20 mt-24">
                    <div className="asset-page__token">
                        <img src={discoTokenUrl} alt="" />
                    </div>
                    <div className="asset-page__balance-details flex items-end justify-between flex-wrap column-gap-16 row-gap-16">
                        <div className="asset-page__balance-copy">
                            <p className="size-28 bold-7 lh-42">{mockAssetOverview.symbol}</p>
                            <p className="size-40 bold-7 lh-60 mt-4">{mockAssetOverview.balance}</p>
                        </div>
                        <button type="button" className="asset-page__withdraw" onClick={() => setShowWithdrawal(true)}>
                            <img src={withdrawIconUrl} className="img-32 flex-none" alt="" />
                            {t('提取')}
                        </button>
                    </div>
                </div>
            </section>

            <section aria-labelledby="asset-history-title">
                <h2 id="asset-history-title" className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                    <img src={sectionStarUrl} className="img-40 flex-none" alt="" />
                    <span>{t('disco 资产明细')}</span>
                </h2>
                <ul className="grid grid-1 row-gap-20 mt-25">
                    {mockAssetRecords.map((record) => (
                        <li key={record.id} className="asset-page__record app-card grid column-gap-16 items-center">
                            <div className={`asset-page__record-icon asset-page__record-icon--${record.direction}`}>
                                <img src={record.direction === 'income' ? incomeIconUrl : expenseIconUrl} alt="" />
                            </div>
                            <div className="asset-page__record-note">
                                <p className="size-28 bold-5 lh-40">{t('备注备注')}</p>
                                <time className="asset-page__muted flex size-24 lh-34 mt-8" dateTime={record.createdAt.replace(' ', 'T')}>
                                    {record.createdAt}
                                </time>
                            </div>
                            <div className="tr">
                                <p className={`asset-page__amount asset-page__amount--${record.direction} size-28 bold-5 lh-40`}>{record.amount}</p>
                                <p className="asset-page__muted size-24 lh-34 mt-8">{record.symbol}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <ConfirmPopup
                show={showWithdrawal}
                title={t('确认提取')}
                message={<div className="flex flex-column row-gap-12">
                    <p>{t('可提取')}</p>
                    <p className="bold-6">{mockAssetOverview.balance} {mockAssetOverview.symbol}</p>
                </div>}
                onClose={closeWithdrawal}
                onConfirm={closeWithdrawal}
            />
        </section>
    )
}
