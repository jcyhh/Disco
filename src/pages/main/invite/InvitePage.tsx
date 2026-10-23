import { usePageReveal } from '@/hooks/usePageReveal.ts'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import dividerUrl from '@/assets/invite/gold-divider.webp'
import backgroundUrl from '@/assets/invite/invitation-background.webp'
import treasureUrl from '@/assets/invite/treasure-chest.webp'
import { message } from '@/components/Message'
import { getReferralLink } from '@/features/integration/referral.ts'
import { getCurrentUser } from '@/features/user/api.ts'
import { useApiResource } from '@/hooks/useApiResource.ts'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { ApiState } from '@/components/ApiState/ApiState.tsx'
import { copyTextToClipboard } from '@/shared/clipboard/copyTextToClipboard'

import './InvitePage.scss'

export function InvitePage() {
    const pageRef = usePageReveal<HTMLElement>()
    const { t } = useTranslation()
    const mounted = useRef(true)
    const user = useApiResource(getCurrentUser)
    const referralCode = user.data?.referral_code ?? ''
    const referralLink = getReferralLink(referralCode)
    usePageRefresh(user.reload)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    async function copy(value: string) {
        if (!value) return
        const copied = await copyTextToClipboard(value)
        if (!mounted.current) return
        if (copied) message.success(t('复制成功'))
        else message.fail(t('复制失败，请手动复制'))
    }

    return (
        <section ref={pageRef} className="invite-page pb-100" data-page="invite" aria-label={t('邀请好友')}>
            <div className="invite-page__background" data-reveal="fade" aria-hidden="true">
                <img src={backgroundUrl} alt="" />
            </div>
            <img src={treasureUrl} className="invite-page__treasure" data-reveal="scale" data-reveal-delay="1" alt="" />

            <div className="invite-page__content">
                <ApiState loading={user.loading} error={user.error} onRetry={user.reload} />
                <div className="invite-page__heading tc" data-reveal="rise" data-reveal-delay="2">
                    <h1 className="invite-page__title size-80 bold-7 lh-112">{t('邀好友 · 启新程')}</h1>
                    <p className="invite-page__subtitle size-28 lh-42 mt-6">{t('分享专属邀请，连接更多伙伴')}</p>
                </div>

                <div className="invite-page__card mt-30" data-reveal="rise">
                    <h2 className="size-28 lh-42 white">{t('我的邀请码')}</h2>
                    <div className="invite-page__code-row flex items-center justify-between column-gap-16 mt-20">
                        <p className="invite-page__code size-52 bold-6 lh-72">{referralCode || '--'}</p>
                        <button type="button" className="invite-page__copy-code flex-none" disabled={!referralCode} onClick={() => void copy(referralCode)}>
                            <span className="invite-page__copy-code-icon flex-none" aria-hidden="true" />
                            <span>{t('复制')}</span>
                        </button>
                    </div>

                    <h2 className="size-28 lh-42 white mt-30">{t('专属邀请链接')}</h2>
                    <div className="invite-page__link-row flex items-center column-gap-20 mt-20">
                        <p className="invite-page__link flex-1 word-ellipsis-1 size-24 lh-36" title={referralLink}>{referralLink}</p>
                    </div>

                    <button
                        type="button"
                        className="invite-page__save mt-50"
                        disabled={!referralLink}
                        onClick={() => void copy(referralLink)}
                    >
                        {t('保存链接')}
                    </button>

                    <div className="invite-page__footer flex items-center justify-center column-gap-20 mt-30">
                        <span className="invite-page__divider flex-none" aria-hidden="true"><img src={dividerUrl} alt="" /></span>
                        <p className="invite-page__footer-copy size-20 lh-28 tc">{t('一起探索更多可能')}</p>
                        <span className="invite-page__divider invite-page__divider--right flex-none" aria-hidden="true"><img src={dividerUrl} alt="" /></span>
                    </div>
                </div>
            </div>

        </section>
    )
}
