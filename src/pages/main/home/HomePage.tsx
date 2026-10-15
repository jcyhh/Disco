import { useState } from 'react'
import { Link } from 'react-router'

import aboutBannerUrl from '@/assets/home/about-banner.webp'
import aboutStarUrl from '@/assets/home/about-star.webp'
import circulationIconUrl from '@/assets/home/circulation.png'
import deflationBannerUrl from '@/assets/home/deflation-banner.webp'
import deflationFireUrl from '@/assets/home/deflation-fire.png'
import explorationBannerUrl from '@/assets/home/exploration-banner.webp'
import explorationStarUrl from '@/assets/common/section-star.png'
import initialPoolIconUrl from '@/assets/home/initial-pool.png'
import initialPriceIconUrl from '@/assets/home/initial-price.png'
import noticeArrowUrl from '@/assets/home/notice-arrow.svg'
import noticeIconUrl from '@/assets/home/notice.png'
import quickActivationCardUrl from '@/assets/home/quick-activation-card.png'
import quickAssetUrl from '@/assets/home/quick-asset.png'
import quickInviteUrl from '@/assets/home/quick-invite.png'
import quickReservationUrl from '@/assets/home/quick-reservation.png'
import reservationIconUrl from '@/assets/home/reservation.png'
import roundVerifiedUrl from '@/assets/home/round-verified.webp'
import totalSupplyIconUrl from '@/assets/home/total-supply.png'
import { usdtIconUrl } from '@/assets/tokens'
import { BasicCarousel } from '@/components/Carousel'
import { Popup } from '@/components/Popup'
import {
    mockHomeAnnouncements,
    mockHomeBanners,
    mockHomeExploration,
    mockHomeTokenOverview,
    type MockHomeAnnouncement,
} from '@/mock'
import { ROUTE_PATH, useAppNavigate } from '@/router'

import './HomePage.scss'

const QUICK_LINKS = [
    { title: '激活卡', path: ROUTE_PATH.activationCard, image: quickActivationCardUrl },
    { title: '预约记录', path: ROUTE_PATH.reservation, image: quickReservationUrl },
    { title: '我的资产', path: ROUTE_PATH.asset, image: quickAssetUrl },
    { title: '邀请好友', path: ROUTE_PATH.invite, image: quickInviteUrl },
] as const

const TOKEN_OVERVIEW = [
    { title: '总发行量', value: mockHomeTokenOverview.totalSupply, image: totalSupplyIconUrl },
    { title: '初始底池', value: mockHomeTokenOverview.initialPool, image: initialPoolIconUrl },
    { title: '初始价格', value: mockHomeTokenOverview.initialPrice, image: initialPriceIconUrl },
    { title: '流通比例', value: mockHomeTokenOverview.circulation, image: circulationIconUrl },
] as const

export function HomePage() {
    const { pushRoute } = useAppNavigate()
    const [announcement, setAnnouncement] = useState<MockHomeAnnouncement | null>(null)

    function closeAnnouncement() {
        setAnnouncement(null)
    }

    function handleReservation() {
        pushRoute(ROUTE_PATH.reservation)
    }

    return (
        <div className="home-page container pb-40" data-page="home">
            <section className="home-page__banner" aria-label="推荐活动">
                <BasicCarousel>
                    {mockHomeBanners.map((banner) => (
                        <img
                            key={banner.id}
                            src={banner.img_url}
                            className="home-page__banner-image"
                            alt="Disco，让精彩始终在线"
                        />
                    ))}
                </BasicCarousel>
            </section>

            <section className="home-page__notice flex items-center mt-20" aria-label="公告">
                <img src={noticeIconUrl} className="img-52 flex-none mr-20" alt="" />
                <BasicCarousel direction="vertical" className="home-page__notice-carousel flex-1">
                    {mockHomeAnnouncements.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="home-page__notice-text flex items-center justify-between size-24 tl"
                            onClick={() => setAnnouncement(item)}
                            aria-label={`查看公告：${item.title}`}
                        >
                            <span className="flex-1 word-ellipsis-1">{item.content}</span>
                            <img src={noticeArrowUrl} className="img-32 flex-none ml-20" alt="" />
                        </button>
                    ))}
                </BasicCarousel>
            </section>

            <nav className="home-page__quick-grid grid grid-4 mt-30" aria-label="快捷入口">
                {QUICK_LINKS.map((item) => (
                    <Link key={item.path} to={item.path} className="home-page__quick-link">
                        <img src={item.image} className="home-page__quick-image" alt="" />
                        <span className="home-page__quick-label tc size-28 bold-5">{item.title}</span>
                    </Link>
                ))}
            </nav>

            <section aria-labelledby="home-exploration-title">
                <h2 id="home-exploration-title" className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                    <img src={explorationStarUrl} className="img-40 flex-none" alt="" />
                    <span>disco 参与探索</span>
                </h2>

                <article className="home-page__exploration mt-20">
                    <div className="home-page__exploration-header">
                        <img src={explorationBannerUrl} className="home-page__exploration-banner" alt="" />
                        <div className="home-page__hero-copy">
                            <h3 className="home-page__hero-title size-52 bold-7 lh-72">开启新旅程</h3>
                            <p className="home-page__hero-subtitle size-24 lh-34 white">每一次参与，获得更多收益</p>
                        </div>
                    </div>

                    <div className="home-page__exploration-body">
                        <div className="flex items-center gap-12 size-24 lh-28">
                            <span>{mockHomeExploration.round}</span>
                            <span className="home-page__verified">
                                <img src={roundVerifiedUrl} alt="已认证" />
                            </span>
                        </div>

                        <div className="home-page__amount flex items-center gap-12 mt-20">
                            <img src={usdtIconUrl} className="img-60 flex-none" alt="" />
                            <strong className="home-page__amount-value size-48 bold-7 lh-72">
                                {mockHomeExploration.amount} {mockHomeExploration.token}
                            </strong>
                        </div>

                        <dl className="home-page__facts grid grid-3 size-24 lh-28 mt-30">
                            <div className="home-page__fact">
                                <dt className="home-page__muted">消耗</dt>
                                <dd className="mt-20 bold-7 word-nowrap">
                                    ${mockHomeExploration.activationCardPrice}激活卡{' '}
                                    <span className="home-page__card-count">x{mockHomeExploration.activationCardCount}</span>
                                </dd>
                            </div>
                            <div className="home-page__fact pl-22">
                                <dt className="home-page__muted">日收益率</dt>
                                <dd className="home-page__yield mt-20 bold-7">{mockHomeExploration.dailyYield}</dd>
                            </div>
                            <div className="home-page__fact pl-22">
                                <dt className="home-page__muted">周期</dt>
                                <dd className="mt-20 bold-7">{mockHomeExploration.durationDays} 天</dd>
                            </div>
                        </dl>

                        <button type="button" className="full-btn mt-30" onClick={handleReservation}>
                            <img src={reservationIconUrl} className="img-48 flex-none" alt="" />
                            立即预约
                        </button>
                    </div>
                </article>
            </section>

            <section className="home-page__about mt-22" aria-labelledby="home-about-title">
                <div className="home-page__about-header">
                    <img src={aboutBannerUrl} className="home-page__about-banner" alt="" />
                    <div className="home-page__about-heading flex items-center">
                        <span className="home-page__about-star"><img src={aboutStarUrl} alt="" /></span>
                        <h2 id="home-about-title" className="size-48 bold-7">认识 disco</h2>
                    </div>
                    <p className="home-page__about-subtitle size-24 bold-5">舞池里的流行货币</p>
                </div>

                <div className="home-page__about-body">
                    <div className="home-page__overview grid grid-2 gap-12">
                        {TOKEN_OVERVIEW.map((item) => (
                            <div key={item.title} className="home-page__overview-item flex items-center gap-16">
                                <img src={item.image} className="img-86 flex-none" alt="" />
                                <dl>
                                    <dt className="home-page__muted size-24">{item.title}</dt>
                                    <dd className="size-28 bold-7 mt-10">{item.value}</dd>
                                </dl>
                            </div>
                        ))}
                    </div>

                    <div className="home-page__deflation mt-20">
                        <img src={deflationBannerUrl} className="home-page__deflation-banner" alt="" />
                        <div className="home-page__deflation-content flex items-center gap-12">
                            <img src={deflationFireUrl} className="img-60 flex-none" alt="" />
                            <span className="home-page__deflation-label size-28 bold-5">通缩比例</span>
                            <strong className="home-page__deflation-value size-40 bold-7">{mockHomeTokenOverview.deflation}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <Popup
                show={announcement !== null}
                title={announcement?.title ?? '公告'}
                onClose={closeAnnouncement}
            >
                <p className="home-page__announcement-copy size-28 lh-42 mt-30">{announcement?.content}</p>
                <button type="button" className="full-btn mt-30" onClick={closeAnnouncement}>知道了</button>
            </Popup>
        </div>
    )
}
