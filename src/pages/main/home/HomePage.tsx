import { usePageReveal } from '@/hooks/usePageReveal.ts'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import aboutBannerUrl from '@/assets/home/about-banner.webp'
import aboutStarUrl from '@/assets/home/about-star.webp'
import circulationIconUrl from '@/assets/home/circulation.png'
import deflationBannerUrl from '@/assets/home/deflation-banner.webp'
import deflationFireUrl from '@/assets/home/deflation-fire.png'
import deflationTokenUrl from '@/assets/home/deflation-token.webp'
import explorationBackgroundUrl from '@/assets/home/exploration-background.webp'
import explorationBannerUrl from '@/assets/home/exploration-banner.webp'
import explorationWordmarkUrl from '@/assets/home/exploration-wordmark.webp'
import explorationStarUrl from '@/assets/common/section-star.png'
import initialPoolIconUrl from '@/assets/home/initial-pool.png'
import initialPriceIconUrl from '@/assets/home/initial-price.png'
import noticeArrowUrl from '@/assets/home/notice-arrow.svg'
import noticeIconUrl from '@/assets/home/notice.png'
import quickActivationCardUrl from '@/assets/home/quick-activation-card.webp'
import quickAssetUrl from '@/assets/home/quick-asset.webp'
import quickInviteUrl from '@/assets/home/quick-invite.webp'
import quickReservationUrl from '@/assets/home/quick-reservation.webp'
import reservationIconUrl from '@/assets/home/reservation.png'
import roundVerifiedUrl from '@/assets/home/round-verified.webp'
import totalSupplyIconUrl from '@/assets/home/total-supply.png'
import switchAmountIconUrl from '@/assets/home/switch-amount.svg'
import { usdtIconUrl } from '@/assets/tokens'
import { BasicCarousel } from '@/components/Carousel'
import { ApiState } from '@/components/ApiState/ApiState.tsx'
import { noticePlainText } from '@/components/NoticeContent/plainText.ts'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { resolveApiAssetUrl } from '@/features/integration/assetUrl.ts'
import { useApiResource } from '@/hooks/useApiResource.ts'
import { HomeNoticePopup } from '@/features/notice/HomeNoticePopup.tsx'
import { ROUTE_PATH, useAppNavigate } from '@/router'

import './HomePage.scss'
import { ReservePopup, type ReserveSelection } from './ReservePopup.tsx'
import { loadHome } from './service.ts'


const QUICK_LINKS = [
    { title: '快捷激活卡', path: ROUTE_PATH.activationCard, image: quickActivationCardUrl },
    { title: '快捷预约记录', path: ROUTE_PATH.reservation, image: quickReservationUrl },
    { title: '快捷我的资产', path: ROUTE_PATH.asset, image: quickAssetUrl },
    { title: '快捷邀请好友', path: ROUTE_PATH.invite, image: quickInviteUrl },
] as const

const TOKEN_OVERVIEW = [
    { title: '总发行量', value: '10亿枚', image: totalSupplyIconUrl },
    { title: '初始底池', value: '10,000', image: initialPoolIconUrl },
    { title: '初始价格', value: '0.001', image: initialPriceIconUrl },
    { title: '流通比例', value: '1%', image: circulationIconUrl },
] as const

export function HomePage() {
    const pageRef = usePageReveal<HTMLDivElement>()
    const { t } = useTranslation()
    const { pushRoute } = useAppNavigate()
    const home = useApiResource(loadHome)
    const [popupMode, setPopupMode] = useState<'reserve' | 'amount' | null>(null)
    const [selected, setSelected] = useState<ReserveSelection | null>(null)
    const rounds = useMemo(() => home.data?.reserves.list.filter((item) => item.amounts.length > 0) ?? [], [home.data?.reserves.list])
    const round = rounds.find((item) => item.round_id === selected?.roundId) ?? rounds[0]
    const tier = round?.amounts.find((item) => item.amount_id === selected?.amountId) ?? round?.amounts[0]
    const selection = useMemo(() => round && tier ? { roundId: round.round_id, amountId: tier.amount_id } : null, [round, tier])
    usePageRefresh(home.reload, popupMode === null)

    function handleReservation() {
        setPopupMode('reserve')
    }

    return (
        <div ref={pageRef} className="home-page container pb-40" data-page="home">
            <ApiState loading={home.loading} error={home.error} onRetry={home.reload} />
            <section className="home-page__banner" data-reveal="scale" aria-label={t('推荐活动')}>
                <BasicCarousel key={(home.data?.banners ?? []).map((banner) => banner.id).join(',')}>
                    {(home.data?.banners ?? []).map((banner) => (
                        <img
                            key={banner.id}
                            src={resolveApiAssetUrl(banner.img_url)}
                            className="home-page__banner-image"
                            alt={t('Disco，让精彩始终在线')}
                        />
                    ))}
                </BasicCarousel>
            </section>

            <section className="home-page__notice flex items-center mt-20" data-reveal="fade" data-reveal-delay="1" aria-label={t('公告')}>
                <img src={noticeIconUrl} className="img-52 flex-none mr-20" alt="" />
                <BasicCarousel key={(home.data?.notices ?? []).map((notice) => notice.id).join(',')} direction="vertical" className="home-page__notice-carousel flex-1">
                    {(home.data?.notices ?? []).map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="home-page__notice-text flex items-center justify-between size-24 tl"
                            onClick={() => pushRoute(ROUTE_PATH.notice)}
                            aria-label={t('公告列表')}
                        >
                            <span className="flex-1 word-ellipsis-1">{t(item.title)} {noticePlainText(item.content)}</span>
                            <img src={noticeArrowUrl} className="img-32 flex-none ml-20" alt="" />
                        </button>
                    ))}
                </BasicCarousel>
            </section>

            <nav className="home-page__quick-grid grid grid-4 mt-30" aria-label={t('快捷入口')}>
                {QUICK_LINKS.map((item, index) => (
                    <Link key={item.path} to={item.path} data-reveal="rise" data-reveal-delay={index + 1} className="home-page__quick-link">
                        <img src={item.image} className="home-page__quick-image" alt="" />
                        <span className="home-page__quick-label tc size-28 bold-5">{t(item.title)}</span>
                    </Link>
                ))}
            </nav>

            <section data-reveal="rise" aria-labelledby="home-exploration-title">
                <h2 id="home-exploration-title" className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                    <img src={explorationStarUrl} className="section-star-motion img-40 flex-none" alt="" />
                    <span>{t('disco 参与探索')}</span>
                </h2>

                <article className="home-page__exploration mt-20">
                    <div className="home-page__exploration-header">
                        <img src={explorationBannerUrl} className="home-page__exploration-banner" alt="" />
                        <span className="home-page__exploration-wordmark flex-center" aria-hidden="true">
                            <span className="home-page__exploration-wordmark-art">
                                <img src={explorationWordmarkUrl} alt="" />
                            </span>
                        </span>
                        <div className="home-page__hero-copy pt-40 pb-40 ml-30">
                            <h3 className="home-page__hero-title size-52 bold-7 lh-72">{t('开启新旅程')}</h3>
                            <p className="home-page__hero-subtitle size-24 lh-34 white">{t('每一次参与，获得更多收益')}</p>
                        </div>
                    </div>

                    <div className="home-page__exploration-body">
                        <div className="home-page__exploration-backdrop" aria-hidden="true">
                            <img src={explorationBackgroundUrl} alt="" />
                        </div>
                        <div className="flex items-center gap-12 size-24 lh-28">
                            <span>{(round?.name ? t(round.name) : '') || (round ? `#${round.round_id}` : '--')}</span>
                            <span className="home-page__verified">
                                <img src={roundVerifiedUrl} alt={t('已认证')} />
                            </span>
                        </div>

                        <div className="flex items-center justify-between flex-wrap column-gap-16 row-gap-12 mt-20">
                            <div className="home-page__amount flex items-center gap-12">
                                <img src={usdtIconUrl} className="img-60 flex-none" alt="" />
                                <strong className="home-page__amount-value size-48 bold-7 lh-72">
                                    {tier?.amount ?? '--'} USDT
                                </strong>
                            </div>
                            <button
                                type="button"
                                className="home-page__switch-amount flex-none"
                                disabled={!tier}
                                onClick={() => setPopupMode('amount')}
                            >
                                <img src={switchAmountIconUrl} className="img-32 flex-none" alt="" />
                                {t('切换金额')}
                            </button>
                        </div>

                        <dl className="home-page__facts flex column-gap-44 size-24 lh-28 mt-30">
                            <div className="home-page__fact flex-2">
                                <dt className="home-page__muted">{t('消耗')}</dt>
                                <dd className="mt-20 bold-7 word-break">
                                    {(tier?.card_name ? t(tier.card_name) : '') || t('{{value}}＄激活卡', { value: tier?.card_amount ?? '--' })}{' '}
                                    <span className="home-page__card-count">x1</span>
                                </dd>
                            </div>
                            <div className="home-page__fact flex-1">
                                <dt className="home-page__muted">{t('日收益率')}</dt>
                                <dd className="home-page__yield mt-20 bold-7">{round?.daily_rate ?? '--'}%</dd>
                            </div>
                            <div className="home-page__fact flex-1">
                                <dt className="home-page__muted">{t('周期')}</dt>
                                <dd className="mt-20 bold-7">{round ? t('{{days}}天', { days: round.days }) : '--'}</dd>
                            </div>
                        </dl>

                        <button type="button" className="full-btn mt-30" disabled={!tier} onClick={handleReservation}>
                            <img src={reservationIconUrl} className="img-48 flex-none" alt="" />
                            {t('立即预约')}
                        </button>
                    </div>
                </article>
            </section>

            <section className="home-page__about mt-22" data-reveal="rise" aria-labelledby="home-about-title">
                <div className="home-page__about-header">
                    <img src={aboutBannerUrl} className="home-page__about-banner" alt="" />
                    <div className="home-page__about-heading flex items-center">
                        <span className="home-page__about-star"><img src={aboutStarUrl} alt="" /></span>
                        <h2 id="home-about-title" className="size-48 bold-7">{t('认识 disco')}</h2>
                    </div>
                    <p className="home-page__about-subtitle size-24 bold-5">{t('舞池里的流行货币')}</p>
                </div>

                <div className="home-page__about-body">
                    <div className="home-page__overview grid grid-2 gap-12 pl-2">
                        {TOKEN_OVERVIEW.map((item) => (
                            <div key={item.title} className="home-page__overview-item flex items-center gap-16">
                                <img src={item.image} className="img-86 flex-none" alt="" />
                                <dl>
                                    <dt className="home-page__muted size-24">{t(item.title)}</dt>
                                    <dd className="size-28 bold-7 mt-10">{t(item.value)}</dd>
                                </dl>
                            </div>
                        ))}
                    </div>

                    <div className="home-page__deflation mt-20">
                        <img src={deflationBannerUrl} className="home-page__deflation-banner" alt="" />
                        <span className="home-page__deflation-token" aria-hidden="true">
                            <img src={deflationTokenUrl} alt="" />
                        </span>
                        <div className="home-page__deflation-content flex items-center gap-12">
                            <img src={deflationFireUrl} className="img-60 flex-none" alt="" />
                            <span className="home-page__deflation-label size-28 bold-5">{t('通缩比例')}</span>
                            <strong className="home-page__deflation-value size-40 bold-7">99%</strong>
                        </div>
                    </div>
                </div>
            </section>

            <HomeNoticePopup result={home.data?.popup ?? null} />
            <ReservePopup
                show={popupMode !== null}
                mode={popupMode ?? 'reserve'}
                rounds={rounds}
                selection={selection}
                onSelect={setSelected}
                onClose={() => setPopupMode(null)}
                onSuccess={home.reload}
            />
        </div>
    )
}
