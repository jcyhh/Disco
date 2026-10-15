import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import card10Url from '@/assets/activation-card/card-10.webp'
import card20Url from '@/assets/activation-card/card-20.webp'
import card30Url from '@/assets/activation-card/card-30.webp'
import cardDecorationUrl from '@/assets/activation-card/card-decoration.svg'
import giftIconUrl from '@/assets/activation-card/gift.svg'
import heroBannerUrl from '@/assets/activation-card/hero-banner.webp'
import heroOverlayUrl from '@/assets/activation-card/hero-overlay.svg'
import moreArrowUrl from '@/assets/activation-card/more-arrow.svg'
import sectionStarUrl from '@/assets/common/section-star.png'
import { message } from '@/components/Message'
import { Popup } from '@/components/Popup'
import {
    getActivationCardRecords,
    mockActivationCards,
    type ActivationCardValue,
    type MockActivationCard,
} from '@/mock'

import { validateActivationCardGift, type ActivationCardGiftValidationError } from './gift.ts'

import './ActivationCardPage.scss'

const CARD_IMAGES: Record<ActivationCardValue, string> = {
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
    const { t } = useTranslation()
    const [historyExpanded, setHistoryExpanded] = useState(false)
    const [giftCard, setGiftCard] = useState<MockActivationCard | null>(null)
    const [showGiftForm, setShowGiftForm] = useState(false)
    const [recipient, setRecipient] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [giftError, setGiftError] = useState('')
    const records = getActivationCardRecords(historyExpanded)

    function openGiftForm(card: MockActivationCard) {
        if (card.ownedCount <= 0) {
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
        setShowGiftForm(false)
    }

    function handleGiftSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!giftCard) return

        const error = validateActivationCardGift({
            address: recipient,
            quantity,
            ownedCount: giftCard.ownedCount,
        })
        if (error) {
            setGiftError(t(GIFT_ERROR_MESSAGES[error]))
            return
        }

        setGiftError('')
        closeGiftForm()
    }

    return (
        <section className="activation-card-page container pb-40" data-page="activation-card" aria-label={t('我的激活卡')}>
            <div className="activation-card-page__hero">
                <img src={heroBannerUrl} className="activation-card-page__hero-image" alt="" />
                <img src={heroOverlayUrl} className="activation-card-page__hero-overlay" alt="" />
                <div className="activation-card-page__hero-copy">
                    <h1 className="activation-card-page__hero-title size-52 bold-7 lh-72">{t('我的激活卡')}</h1>
                    <p className="activation-card-page__hero-subtitle size-24 lh-34 white mt-6">{t('汇聚专属卡片')}</p>
                </div>
            </div>

            <section aria-labelledby="activation-cards-title">
                <h2 id="activation-cards-title" className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                    <img src={sectionStarUrl} className="img-40 flex-none" alt="" />
                    <span>{t('disco 激活卡')}</span>
                </h2>

                <div className="activation-card-page__card-list grid grid-1 row-gap-20 mt-24">
                    {mockActivationCards.map((card) => (
                        <article key={card.id} className="activation-card-page__card grid column-gap-20">
                            <img src={cardDecorationUrl} className="activation-card-page__card-decoration" alt="" />
                            <img src={CARD_IMAGES[card.faceValue]} className="activation-card-page__card-image" alt="" />
                            <div className="activation-card-page__card-info flex flex-column justify-between row-gap-10">
                                <div className="pl-10 pt-4">
                                    <h3 className="size-32 bold-6 lh-44">{t('{{value}}＄激活卡', { value: card.faceValue })}</h3>
                                    <p className="activation-card-page__muted size-24 lh-34 mt-10">
                                        {t('拥有数量：')}
                                        <span className="activation-card-page__count bold-6">{t('{{count}}张', { count: card.ownedCount })}</span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="activation-card-page__gift"
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
                <div className="flex items-center justify-between flex-wrap column-gap-16 mt-30">
                    <h2 id="activation-card-records-title" className="flex items-center gap-4 size-32 bold-6 lh-44">
                        <img src={sectionStarUrl} className="img-40 flex-none" alt="" />
                        <span>{t('激活卡记录')}</span>
                    </h2>
                    <button
                        type="button"
                        className="activation-card-page__more inline-flex items-center column-gap-10 size-24 lh-36"
                        aria-expanded={historyExpanded}
                        aria-controls="activation-card-records"
                        onClick={() => setHistoryExpanded((expanded) => !expanded)}
                    >
                        {t(historyExpanded ? '收起' : '查看更多')}
                        <img src={moreArrowUrl} className="activation-card-page__more-arrow img-16 flex-none" alt="" />
                    </button>
                </div>

                <ul id="activation-card-records" className="grid grid-1 row-gap-20 mt-30">
                    {records.map((record) => (
                        <li key={record.id} className="activation-card-page__record app-card flex items-center justify-between flex-wrap gap-16">
                            <p className="black size-28 bold-5 lh-40">{t('获得{{value}}$激活卡', { value: record.faceValue })}</p>
                            <time
                                className="activation-card-page__muted size-24 lh-36 word-nowrap"
                                dateTime={record.createdAt.replaceAll('.', '-').replace(' ', 'T')}
                            >
                                {record.createdAt}
                            </time>
                        </li>
                    ))}
                </ul>
            </section>

            <Popup show={showGiftForm} title={t('转赠激活卡')} onClose={closeGiftForm}>
                <form className="activation-card-page__gift-form flex flex-column row-gap-20 size-24 lh-36 mt-30" noValidate onSubmit={handleGiftSubmit}>
                    <p className="bold-6">
                        {t('{{value}}＄激活卡', { value: giftCard?.faceValue ?? '' })}
                        {' · '}{t('拥有数量：')}{t('{{count}}张', { count: giftCard?.ownedCount ?? 0 })}
                    </p>
                    <label className="activation-card-page__field flex flex-column row-gap-10">
                        <span>{t('接收地址')}</span>
                        <input
                            className="activation-card-page__input"
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
                            className="activation-card-page__input"
                            type="text"
                            name="quantity"
                            inputMode="numeric"
                            autoComplete="off"
                            value={quantity}
                            onChange={(event) => { setQuantity(event.target.value); setGiftError('') }}
                        />
                    </label>
                    {giftError ? <p className="red lh-36" role="alert">{giftError}</p> : null}
                    <button type="submit" className="activation-card-page__form-submit">{t('确认')}</button>
                </form>
            </Popup>
        </section>
    )
}
