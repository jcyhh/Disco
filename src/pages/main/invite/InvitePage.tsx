import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import copyLinkIconUrl from '@/assets/invite/copy-link.svg'
import dividerUrl from '@/assets/invite/gold-divider.webp'
import backgroundUrl from '@/assets/invite/invitation-background.webp'
import treasureUrl from '@/assets/invite/treasure-chest.webp'
import { message } from '@/components/Message'
import { Popup } from '@/components/Popup'
import { getMockReferralLink, mockReferralCode } from '@/mock/referral'
import { copyTextToClipboard } from '@/shared/clipboard/copyTextToClipboard'

import { createInvitationPoster } from './poster'
import './InvitePage.scss'

export function InvitePage() {
    const { t } = useTranslation()
    const [generatingPoster, setGeneratingPoster] = useState(false)
    const [posterUrl, setPosterUrl] = useState('')
    const [showPoster, setShowPoster] = useState(false)
    const mounted = useRef(true)
    const posterObjectUrl = useRef('')
    const referralLink = getMockReferralLink()

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
            if (posterObjectUrl.current) URL.revokeObjectURL(posterObjectUrl.current)
        }
    }, [])

    async function copy(value: string) {
        const copied = await copyTextToClipboard(value)
        if (!mounted.current) return
        if (copied) message.success(t('复制成功'))
        else message.fail(t('复制失败，请手动复制'))
    }

    async function preparePoster() {
        if (generatingPoster) return
        setGeneratingPoster(true)
        try {
            const blob = await createInvitationPoster({
                backgroundUrl,
                treasureUrl,
                dividerUrl,
                title: t('邀好友 · 启新程'),
                subtitle: t('分享专属邀请，连接更多伙伴'),
                codeLabel: t('我的邀请码'),
                linkLabel: t('专属邀请链接'),
                footer: t('一起探索更多可能'),
                code: mockReferralCode,
                link: referralLink,
            })
            if (!mounted.current) return
            if (posterObjectUrl.current) URL.revokeObjectURL(posterObjectUrl.current)
            const url = URL.createObjectURL(blob)
            posterObjectUrl.current = url
            setPosterUrl(url)
            setShowPoster(true)
        } catch {
            if (mounted.current) message.fail(t('海报生成失败，请重试'))
        } finally {
            if (mounted.current) setGeneratingPoster(false)
        }
    }

    return (
        <section className="invite-page pb-100" data-page="invite" aria-label={t('邀请好友')}>
            <div className="invite-page__background" aria-hidden="true">
                <img src={backgroundUrl} alt="" />
            </div>
            <img src={treasureUrl} className="invite-page__treasure" alt="" />

            <div className="invite-page__content">
                <div className="invite-page__heading tc">
                    <h1 className="invite-page__title size-80 bold-7 lh-112">{t('邀好友 · 启新程')}</h1>
                    <p className="invite-page__subtitle size-28 lh-42 mt-6">{t('分享专属邀请，连接更多伙伴')}</p>
                </div>

                <div className="invite-page__card mt-30">
                    <h2 className="size-28 lh-42 white">{t('我的邀请码')}</h2>
                    <div className="invite-page__code-row flex items-center justify-between column-gap-16 mt-20">
                        <p className="invite-page__code size-52 bold-6 lh-72">{mockReferralCode}</p>
                        <button type="button" className="invite-page__copy-code flex-none" onClick={() => void copy(mockReferralCode)}>
                            <span className="invite-page__copy-code-icon flex-none" aria-hidden="true" />
                            <span>{t('复制')}</span>
                        </button>
                    </div>

                    <h2 className="size-28 lh-42 white mt-30">{t('专属邀请链接')}</h2>
                    <div className="invite-page__link-row flex items-center column-gap-20 mt-20">
                        <p className="invite-page__link flex-1 word-ellipsis-1 size-24 lh-36" title={referralLink}>{referralLink}</p>
                        <button
                            type="button"
                            className="invite-page__copy-link flex-none"
                            aria-label={t('复制邀请链接')}
                            onClick={() => void copy(referralLink)}
                        >
                            <img src={copyLinkIconUrl} className="img-30" alt="" />
                        </button>
                    </div>

                    <button
                        type="button"
                        className="invite-page__save mt-50"
                        disabled={generatingPoster}
                        aria-busy={generatingPoster}
                        onClick={() => void preparePoster()}
                    >
                        {t(generatingPoster ? '正在生成海报' : '保存海报')}
                    </button>

                    <div className="invite-page__footer flex items-center justify-center column-gap-20 mt-30">
                        <span className="invite-page__divider flex-none" aria-hidden="true"><img src={dividerUrl} alt="" /></span>
                        <p className="invite-page__footer-copy size-20 lh-28 tc">{t('一起探索更多可能')}</p>
                        <span className="invite-page__divider invite-page__divider--right flex-none" aria-hidden="true"><img src={dividerUrl} alt="" /></span>
                    </div>
                </div>
            </div>

            <Popup show={showPoster} title={t('邀请海报')} onClose={() => setShowPoster(false)}>
                {posterUrl && <img src={posterUrl} className="invite-page__poster-preview" alt={t('邀请海报')} />}
                <a href={posterUrl || undefined} download={`Disco-invite-${mockReferralCode}.png`} className="invite-page__download mt-24">
                    {t('下载海报')}
                </a>
            </Popup>
        </section>
    )
}
