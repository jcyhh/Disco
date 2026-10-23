import { usePageReveal } from '@/hooks/usePageReveal.ts'
import { useCallback, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import card10Url from '@/assets/activation-card/card-10.webp'
import card20Url from '@/assets/activation-card/card-20.webp'
import card30Url from '@/assets/activation-card/card-30.webp'
import cardDecorationUrl from '@/assets/activation-card/card-decoration.svg'
import giftIconUrl from '@/assets/activation-card/gift.svg'
import heroBannerUrl from '@/assets/activation-card/hero-banner.webp'
import heroOverlayUrl from '@/assets/activation-card/hero-overlay.svg'
import sectionStarUrl from '@/assets/common/section-star.png'
import { message } from '@/components/Message'
import { ApiState } from '@/components/ApiState/ApiState.tsx'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { getActivationCards, getActivationCardLogs, giftActivationCard } from '@/features/activation-card/api.ts'
import type { ActivationCard } from '@/features/activation-card/types.ts'
import { getCardArt } from '@/features/integration/cardArt.ts'
import { useApiResource } from '@/hooks/useApiResource.ts'
import { useApiList } from '@/hooks/useApiList.ts'
import { useApiMutation } from '@/hooks/useApiMutation.ts'
import { getWalletAddress } from '@/services/storage/common.ts'
import { Popup } from '@/components/Popup'

import { validateActivationCardGift, type ActivationCardGiftValidationError } from './gift.ts'

import './ActivationCardPage.scss'

const CARD_IMAGES: Record<10 | 20 | 30, string> = {
    10: card10Url,
    20: card20Url,
    30: card30Url,
}

const GIFT_ERROR_MESSAGES: Record<ActivationCardGiftValidationError, string> = {
    'address-required': '请输入接收钱包地址',
    'address-invalid': '请输入正确的钱包地址',
    'quantity-invalid': '转赠数量必须为正整数',
    'insufficient-cards': '转赠数量不能超过拥有数量',
}

export function ActivationCardPage() {
    const pageRef = usePageReveal<HTMLElement>()
    const { t } = useTranslation()
    const [giftCard, setGiftCard] = useState<ActivationCard | null>(null)
    const [showGiftForm, setShowGiftForm] = useState(false)
    const [recipient, setRecipient] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [giftError, setGiftError] = useState('')
    const cards = useApiResource(getActivationCards)
    const logs = useApiList(getActivationCardLogs)
    const { submitting, execute } = useApiMutation()
    const reloadCards = cards.reload
    const reloadLogs = logs.reload
    const refresh = useCallback(async () => { await Promise.all([reloadCards(), reloadLogs()]) }, [reloadCards, reloadLogs])
    usePageRefresh(refresh, !submitting && !showGiftForm)

    function openGiftForm(card: ActivationCard) {
        if (card.num <= 0) {
            message.info(t('暂无可转赠的激活卡'))
            return
        }
        setGiftCard(card)
        setRecipient('')
        setQuantity('1')
        setGiftError('')
        setShowGiftForm(true)
    }

    function closeGiftForm() {
        if (!submitting) setShowGiftForm(false)
    }

    function handleGiftSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!giftCard || submitting) return

        const error = validateActivationCardGift({
            address: recipient,
            quantity,
            ownedCount: giftCard.num,
        })
        if (error) {
            setGiftError(t(GIFT_ERROR_MESSAGES[error]))
            return
        }

        if (Number(quantity) > 1000000) { setGiftError(t('单次最多一百万张')); return }
        if (recipient.trim().toLowerCase() === getWalletAddress().toLowerCase()) { setGiftError(t('不能赠送给自己')); return }
        setGiftError('')
        void execute((signal) => giftActivationCard({ address: recipient.trim(), card_id: giftCard.id, num: Number(quantity) }, signal), async () => {
            setShowGiftForm(false)
            message.success(t('转赠成功'))
            await refresh()
        })
    }

    return (
        <section ref={pageRef} className="activation-card-page container pb-40" data-page="activation-card" aria-label={t('我的激活卡')}>
            <div className="activation-card-page__hero" data-reveal="scale">
                <img src={heroBannerUrl} className="activation-card-page__hero-image" alt="" />
                <img src={heroOverlayUrl} className="activation-card-page__hero-overlay" alt="" />
                <div className="activation-card-page__hero-copy">
                    <h1 className="activation-card-page__hero-title size-52 bold-7 lh-72">{t('我的激活卡')}</h1>
                    <p className="activation-card-page__hero-subtitle size-24 lh-34 white mt-6">{t('汇聚专属卡片')}</p>
                </div>
            </div>

            <ApiState loading={cards.loading} error={cards.error} empty={cards.data?.length === 0} onRetry={cards.reload} />
            <section aria-labelledby="activation-cards-title">
                <h2 id="activation-cards-title" className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                    <img src={sectionStarUrl} className="section-star-motion img-40 flex-none" alt="" />
                    <span>{t('disco 激活卡')}</span>
                </h2>

                <div className="activation-card-page__card-list grid grid-1 row-gap-20 mt-24">
                    {(cards.data ?? []).map((card, index) => (
                        <article key={card.id} className="activation-card-page__card grid column-gap-20" data-reveal="rise" data-reveal-delay={Math.min(index, 3) + 1}>
                            <img src={cardDecorationUrl} className="activation-card-page__card-decoration" alt="" />
                            {getCardArt(card.amount, CARD_IMAGES) ? <img src={getCardArt(card.amount, CARD_IMAGES)} className="activation-card-page__card-image" alt="" /> : <div className="activation-card-page__card-image flex-center app-color size-32 bold-6">{card.amount} USDT</div>}
                            <div className="activation-card-page__card-info flex flex-column justify-between row-gap-10">
                                <div className="pl-10 pt-4">
                                    <h3 className="size-32 bold-6 lh-44">{(card.name ? t(card.name) : '') || t('{{value}}＄激活卡', { value: card.amount })}</h3>
                                    <p className="activation-card-page__muted size-24 lh-34 mt-10">
                                        {t('拥有数量：')}
                                        <span className="activation-card-page__count bold-6">{t('{{count}}张', { count: card.num })}</span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className={`activation-card-page__gift${card.num <= 0 ? ' opc-5' : ''}`}
                                    disabled={card.num <= 0}
                                    onClick={() => openGiftForm(card)}
                                >
                                    <img src={giftIconUrl} className="img-30 flex-none" alt="" />
                                    {t('转赠')}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section aria-labelledby="activation-card-records-title">
                <h2 id="activation-card-records-title" className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                    <img src={sectionStarUrl} className="section-star-motion img-40 flex-none" alt="" />
                    <span>{t('激活卡记录')}</span>
                </h2>
                <InfiniteScroll loading={logs.loading} hasMore={logs.hasMore} onLoadMore={logs.loadMore} disabled={logs.error || submitting || showGiftForm}>
                    <ul id="activation-card-records" className="grid grid-1 row-gap-20 mt-30">
                        {logs.items.map((record) => (
                            <li key={record.id} className="activation-card-page__record app-card flex items-center justify-between flex-wrap gap-16" data-reveal="rise">
                                <p className="black size-28 bold-5 lh-40">{record.content} · {(record.card_name ? t(record.card_name) : '') || t('{{value}}＄激活卡', { value: record.amount })} {record.is_inc === 1 ? '+' : '−'}{record.num}</p>
                                <time
                                    className="activation-card-page__muted size-24 lh-36 word-nowrap"
                                    dateTime={record.created_at.replaceAll('.', '-').replace(' ', 'T')}
                                >
                                    {record.created_at}
                                </time>
                            </li>
                        ))}
                    </ul>
                    <ApiState loading={logs.loading} error={logs.error} empty={!logs.items.length} onRetry={logs.retry} />
                </InfiniteScroll>
            </section>

            <Popup show={showGiftForm} title={t('转赠激活卡')} onClose={submitting ? undefined : closeGiftForm}>
                <form className="activation-card-page__gift-form flex flex-column row-gap-20 size-24 lh-36 mt-30" noValidate onSubmit={handleGiftSubmit}>
                    <p className="bold-6">
                        {(giftCard?.name ? t(giftCard.name) : '') || t('{{value}}＄激活卡', { value: giftCard?.amount ?? '' })}
                        {' · '}{t('拥有数量：')}{t('{{count}}张', { count: giftCard?.num ?? 0 })}
                    </p>
                    <label className="activation-card-page__field flex flex-column row-gap-10">
                        <span>{t('接收地址')}</span>
                        <input
                            className="activation-card-page__input" disabled={submitting}
                            type="text"
                            name="recipient"
                            autoComplete="off"
                            placeholder={t('请输入接收钱包地址')}
                            value={recipient}
                            onChange={(event) => { setRecipient(event.target.value); setGiftError('') }}
                        />
                    </label>
                    <label className="activation-card-page__field flex flex-column row-gap-10">
                        <span>{t('转赠数量')}</span>
                        <input
                            className="activation-card-page__input" disabled={submitting}
                            type="text"
                            name="quantity"
                            inputMode="numeric"
                            autoComplete="off"
                            value={quantity}
                            onChange={(event) => { setQuantity(event.target.value); setGiftError('') }}
                        />
                    </label>
                    {giftError ? <p className="red lh-36" role="alert">{giftError}</p> : null}
                    <button type="submit" disabled={submitting} aria-busy={submitting} className="activation-card-page__form-submit">{t('确认')}</button>
                </form>
            </Popup>
        </section>
    )
}
