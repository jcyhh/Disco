import { usePageReveal } from '@/hooks/usePageReveal.ts'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import sectionStarUrl from '@/assets/common/section-star.png'
import copyIconUrl from '@/assets/team/copy.webp'
import directCountIconUrl from '@/assets/team/direct-count.webp'
import effectiveDirectIconUrl from '@/assets/team/effective-direct.webp'
import heroBannerUrl from '@/assets/team/hero-banner.webp'
import memberPersonalPerformanceIconUrl from '@/assets/team/member-personal-performance.webp'
import memberTeamPerformanceIconUrl from '@/assets/team/member-team-performance.webp'
import personalPerformanceIconUrl from '@/assets/team/personal-performance.webp'
import referralLinkIconUrl from '@/assets/team/referral-link.webp'
import teamCountIconUrl from '@/assets/team/team-count.webp'
import teamPerformanceIconUrl from '@/assets/team/team-performance.webp'
import { BusinessPageHero } from '@/components/BusinessPageHero'
import { message } from '@/components/Message'
import { ACTIVATION_CARD_COVERS } from '@/features/activation-card/config.ts'
import { getCurrentUser, getReferrals } from '@/features/user/api.ts'
import type { ReferralUser } from '@/features/user/types.ts'
import { getReferralLink } from '@/features/integration/referral.ts'
import { useApiResource } from '@/hooks/useApiResource.ts'
import { useApiList } from '@/hooks/useApiList.ts'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { ApiListFooter } from '@/components/ApiState/ApiState.tsx'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'
import { copyTextToClipboard } from '@/shared/clipboard/copyTextToClipboard.ts'

import './TeamPage.scss'

const TEAM_STATISTICS = [
    { label: '团队人数', field: 'team_count', image: teamCountIconUrl, crop: 'team-count' },
    { label: '直推人数', field: 'referral_count', image: directCountIconUrl, crop: 'direct-count' },
    { label: '有效直推', field: 'valid_referral_count', image: effectiveDirectIconUrl, crop: 'effective-direct' },
] as const

function formatTeamPerformance(value: string | null | undefined): string {
    return value == null || value === '' ? '--' : formatAmount(value)
}

function TeamMemberCard({ member }: { member: ReferralUser }) {
    const { t } = useTranslation()

    return (
        <li className="team-page__member app-card" data-reveal="rise">
            <div className="flex items-center justify-between flex-wrap column-gap-16 row-gap-10">
                <p className="size-28 bold-5 lh-40">{member.address}</p>
                <time
                    className="team-page__muted size-24 lh-34 word-nowrap"
                    dateTime={member.created_at.replaceAll('.', '-').replace(' ', 'T')}
                >
                    {member.created_at}
                </time>
            </div>

            <div className="team-page__member-performance grid grid-2 mt-22">
                <div className="team-page__metric flex items-center column-gap-16">
                    <span className="team-page__artwork team-page__artwork--member-team img-60 flex-none" aria-hidden="true">
                        <img src={memberTeamPerformanceIconUrl} alt="" />
                    </span>
                    <dl className="team-page__metric-copy">
                        <dt className="team-page__muted size-20 lh-28">{t('团队业绩(USDT)')}</dt>
                        <dd className="team-page__member-value size-24 bold-7 lh-34 mt-4">{formatTeamPerformance(member.team_kpi)}</dd>
                    </dl>
                </div>
                <div className="team-page__metric flex items-center column-gap-16">
                    <img src={memberPersonalPerformanceIconUrl} className="team-page__performance-image img-60 flex-none" alt="" />
                    <dl className="team-page__metric-copy">
                        <dt className="team-page__muted size-20 lh-28">{t('个人业绩(USDT)')}</dt>
                        <dd className="team-page__member-value size-24 bold-7 lh-34 mt-4">{formatTeamPerformance(member.kpi)}</dd>
                    </dl>
                </div>
            </div>
        </li>
    )
}

export function TeamPage() {
    const pageRef = usePageReveal<HTMLElement>()
    const { t } = useTranslation()
    const user = useApiResource(getCurrentUser)
    const members = useApiList(getReferrals)
    const referralLink = getReferralLink(user.data?.referral_code ?? '')
    const reloadUser = user.reload
    const reloadMembers = members.reload
    const refresh = useCallback(async () => { await Promise.all([reloadUser(), reloadMembers()]) }, [reloadUser, reloadMembers])
    usePageRefresh(refresh)

    async function handleCopyReferralLink() {
        if (!referralLink) return
        const copied = await copyTextToClipboard(referralLink)
        if (copied) {
            message.success(t('复制成功'))
        } else {
            message.warning(t('复制失败，请手动复制'))
        }
    }

    return (
        <section ref={pageRef} className="team-page container pb-40" data-page="team" aria-label={t('我的团队')}>
            <BusinessPageHero imageUrl={heroBannerUrl} title={t('我的团队')} subtitle={t('汇聚同行力量')} />

            <div className="team-page__referral app-card grid column-gap-20 mt-30" data-reveal="rise" data-reveal-delay="1">
                <div className="team-page__referral-icon flex-center">
                    <span className="team-page__artwork team-page__artwork--referral img-88" aria-hidden="true">
                        <img src={referralLinkIconUrl} alt="" />
                    </span>
                </div>
                <div className="team-page__referral-info pt-6">
                    <div className="flex items-center justify-between column-gap-16">
                        <p className="size-24 lh-34">{t('我的邀请链接')}</p>
                        <button
                            type="button"
                            className="team-page__copy flex items-center flex-none app-color size-24 lh-34"
                            disabled={!referralLink} onClick={handleCopyReferralLink}
                            aria-label={t('复制邀请链接')}
                        >
                            <span className="team-page__artwork team-page__artwork--copy img-28 flex-none" aria-hidden="true">
                                <img src={copyIconUrl} alt="" />
                            </span>
                            {t('复制')}
                        </button>
                    </div>
                    <p className="team-page__referral-link word-ellipsis-1 size-24 lh-34 mt-20" title={referralLink}>
                        {referralLink || '--'}
                    </p>
                </div>
            </div>

            <div className="grid grid-3 column-gap-15 mt-10">
                {TEAM_STATISTICS.map((item, index) => (
                    <div key={item.crop} className="team-page__stat tc pt-96 pb-22 pl-10 pr-10" data-reveal="rise" data-reveal-delay={index + 1}>
                        <span className={`team-page__artwork team-page__stat-artwork team-page__artwork--${item.crop} img-86`} aria-hidden="true">
                            <img src={item.image} alt="" />
                        </span>
                        <strong className="team-page__stat-value size-28 bold-7 lh-40">{user.data?.[item.field] ?? '--'}</strong>
                        <p className="team-page__muted size-24 lh-34 mt-4">{t(item.label)}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-2 column-gap-10 mt-15">
                <div className="team-page__performance app-row-card flex items-center column-gap-16" data-reveal="rise">
                    <img src={teamPerformanceIconUrl} className="team-page__performance-image img-86 flex-none" alt="" />
                    <dl className="team-page__metric-copy">
                        <dt className="team-page__muted size-24 lh-34">{t('团队业绩(USDT)')}</dt>
                        <dd className="app-color size-28 bold-7 lh-40 mt-10">{formatTeamPerformance(user.data?.team_kpi)}</dd>
                    </dl>
                </div>
                <div className="team-page__performance app-row-card flex items-center column-gap-16" data-reveal="rise">
                    <img src={personalPerformanceIconUrl} className="team-page__performance-image img-86 flex-none" alt="" />
                    <dl className="team-page__metric-copy">
                        <dt className="team-page__muted size-24 lh-34">{t('个人业绩(USDT)')}</dt>
                        <dd className="app-color size-28 bold-7 lh-40 mt-10">{formatTeamPerformance(user.data?.kpi)}</dd>
                    </dl>
                </div>
            </div>

            <section className="mt-30" aria-labelledby="team-activation-cards-title">
                <h2 id="team-activation-cards-title" className="flex items-center gap-4 size-32 bold-6 lh-44">
                    <img src={sectionStarUrl} className="section-star-motion img-40 flex-none" alt="" />
                    <span>{t('团队激活卡统计')}</span>
                </h2>
                <div className="grid grid-1 row-gap-12 mt-24">
                    {ACTIVATION_CARD_COVERS.map((cover, index) => {
                        const card = user.data?.team_cards?.[index]
                        const holderCount = card?.holder_count
                        const totalCount = card?.num
                        return (
                            <article key={cover.ownedImage} className="team-page__activation-card app-card flex items-center column-gap-20" data-reveal="rise">
                                <img src={cover.ownedImage} className="team-page__activation-card-image img-80 flex-none" alt="" />
                                <div className="team-page__activation-card-info flex-1">
                                    <h3 className="size-28 bold-6 lh-40">{card?.name || '--'}</h3>
                                    <dl className="grid grid-2 column-gap-16 mt-10">
                                        <div className="team-page__activation-card-metric flex flex-wrap column-gap-10 row-gap-2">
                                            <dt className="team-page__muted size-24 lh-34">{t('持有人数')}</dt>
                                            <dd className="team-page__activation-card-count inline-flex column-gap-5 word-nowrap">
                                                <strong className="size-30 bold-7 lh-38">{holderCount ?? '--'}</strong>
                                                {holderCount != null ? <span className="team-page__muted size-20 lh-30">{t('人', { count: holderCount })}</span> : null}
                                            </dd>
                                        </div>
                                        <div className="team-page__activation-card-metric flex flex-wrap column-gap-10 row-gap-2">
                                            <dt className="team-page__muted size-24 lh-34">{t('持有总量')}</dt>
                                            <dd className="team-page__activation-card-count inline-flex column-gap-5 word-nowrap">
                                                <strong className="team-page__activation-card-total size-30 bold-7 lh-38">{totalCount ?? '--'}</strong>
                                                {totalCount != null ? <span className="team-page__muted size-20 lh-30">{t('张', { count: totalCount })}</span> : null}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </section>

            <h2 className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                <img src={sectionStarUrl} className="section-star-motion img-40 flex-none" alt="" />
                <span>{t('直推成员列表')}</span>
            </h2>
            <ul className="grid grid-1 row-gap-20 mt-25">
                {members.items.map((member) => <TeamMemberCard key={member.id} member={member} />)}
            </ul>
            <ApiListFooter
                {...members}
                error={false}
                hasMore={members.hasMore && members.items.length > 0}
                loadMore={members.error ? members.retry : members.loadMore}
            />
        </section>
    )
}
