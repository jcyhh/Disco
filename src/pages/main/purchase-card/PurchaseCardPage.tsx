import { usePageReveal } from '@/hooks/usePageReveal.ts'
import { useCallback, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import sectionStarUrl from '@/assets/common/section-star.png'
import heroBannerUrl from '@/assets/purchase-card/hero-banner.webp'
import selectedUrl from '@/assets/purchase-card/selected.svg'
import unselectedUrl from '@/assets/purchase-card/unselected.svg'
import { BusinessPageHero } from '@/components/BusinessPageHero'
import { ConfirmPopup } from '@/components/ConfirmPopup'
import { Icon } from '@/components/Icon'
import { message } from '@/components/Message'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { getActivationCards } from '@/features/activation-card/api.ts'
import { ACTIVATION_CARD_COVERS } from '@/features/activation-card/config.ts'
import { getCurrentUser } from '@/features/user/api.ts'
import { buyActivationCardsWithWallet } from '@/services/contracts/disco.ts'
import { useContractMutation } from '@/hooks/useContractMutation.ts'
import { multiplyDecimalNumbers } from '@/shared/calculations/decimalNumbers.ts'
import { useApiResource } from '@/hooks/useApiResource.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'

import { parsePurchaseQuantity } from './purchase.ts'

import './PurchaseCardPage.scss'

export function PurchaseCardPage() {
    const pageRef = usePageReveal<HTMLElement>()
    const { t } = useTranslation()
    const { submitting, execute } = useContractMutation()
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
    const [quantityText, setQuantityText] = useState('1')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const cards = useApiResource(getActivationCards)
    const user = useApiResource(getCurrentUser)
    const cardsReady = !cards.loading && !cards.error && cards.data !== null
    const userReady = !user.loading && !user.error && user.data !== null
    const availableCards = cardsReady ? cards.data ?? [] : []
    const selectedCard = availableCards.find((card) => card.id === selectedCardId) ?? availableCards[0]
    const canPurchase = userReady && selectedCard !== undefined
    const quantity = parsePurchaseQuantity(quantityText)
    const total = selectedCard && quantity !== null ? multiplyDecimalNumbers(selectedCard.amount, quantity) : null
    const totalText = total === null ? '--' : formatAmount(total)
    const reloadCards = cards.reload
    const reloadUser = user.reload
    const refresh = useCallback(async () => { await Promise.all([reloadCards(), reloadUser()]) }, [reloadCards, reloadUser])
    usePageRefresh(refresh, !showConfirmation && !submitting)

    function changeQuantity(step: -1 | 1) {
        const current = parsePurchaseQuantity(quantityText)
        setQuantityText(String(current === null ? 1 : Math.min(1000000, Math.max(1, current + step))))
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!canPurchase || !selectedCard) return
        if (quantity === null || quantity > 1000000) {
            message.info(t('购买数量须为一到一百万的整数'))
            return
        }
        setQuantityText(String(quantity))
        setShowConfirmation(true)
    }

    function purchase() {
        if (!canPurchase || !selectedCard || quantity === null || total === null) return
        void execute((signal) => buyActivationCardsWithWallet(selectedCard.id, quantity, total, signal), async () => {
            setShowConfirmation(false)
            message.success(t('购买成功'))
            await refresh()
        })
    }

    return (
        <section ref={pageRef} className="purchase-card-page container pb-40" data-page="purchase-card" aria-label={t('购买激活卡')}>
            <BusinessPageHero imageUrl={heroBannerUrl} title={t('购买激活卡')} subtitle={t('开启全新体验')} overlayUrl={null} />

            <form noValidate onSubmit={handleSubmit}>
                <h2 id="purchase-card-options-title" className="flex items-center gap-4 size-32 bold-6 lh-44 mt-30">
                    <img src={sectionStarUrl} className="section-star-motion img-40 flex-none" alt="" />
                    {t('选择专属激活卡')}
                </h2>
                <fieldset className="purchase-card-page__options grid grid-3 column-gap-15 row-gap-30 mt-24" aria-labelledby="purchase-card-options-title">
                    {availableCards.map((card, index) => {
                        const cover = ACTIVATION_CARD_COVERS[index]
                        return (
                            <label key={card.id} className="purchase-card-page__option tap-target flex" data-reveal="rise" data-reveal-delay={Math.min(index, 3) + 1}>
                                <input
                                    className="purchase-card-page__radio"
                                    type="radio"
                                    name="activation-card"
                                    value={card.id}
                                    checked={selectedCard?.id === card.id}
                                    onChange={() => setSelectedCardId(card.id)}
                                />
                                <span className="purchase-card-page__card flex flex-1 flex-column items-center tc">
                                    {cover ? <img src={cover.purchaseImage} className="purchase-card-page__art" alt="" /> : null}
                                    <span className="purchase-card-page__info flex flex-column items-center mt-12">
                                        <span className="purchase-card-page__name size-26 bold-5 lh-36">{card.name}</span>
                                        <span className="purchase-card-page__price size-28 bold-6 lh-40 mt-6">{formatAmount(card.amount)} USDT</span>
                                    </span>
                                    <img src={selectedCard?.id === card.id ? selectedUrl : unselectedUrl} className="purchase-card-page__indicator" alt="" />
                                </span>
                            </label>
                        )
                    })}
                </fieldset>

                <label htmlFor="purchase-card-quantity" className="purchase-card-page__quantity-label inline-flex items-center column-gap-10 size-32 bold-5 lh-44 black mt-30">
                    {t('购买数量')}
                </label>
                <div className="purchase-card-page__stepper flex items-center mt-24" data-reveal="rise">
                    <button type="button" className="purchase-card-page__minus flex-none size-40" aria-label={t('减少数量')} disabled={quantity === 1} onClick={() => changeQuantity(-1)}>
                        <span aria-hidden="true">−</span>
                    </button>
                    <input
                        id="purchase-card-quantity"
                        className="purchase-card-page__quantity flex-1 tc size-40 bold-5 lh-56 black"
                        type="text"
                        name="quantity"
                        inputMode="numeric"
                        autoComplete="off"
                        value={quantityText}
                        onChange={(event) => setQuantityText(event.target.value)}
                        onBlur={() => { if (quantity !== null) setQuantityText(String(quantity)) }}
                    />
                    <button type="button" className="purchase-card-page__plus flex-none" aria-label={t('增加数量')} disabled={quantity === 1000000} onClick={() => changeQuantity(1)}>
                        <Icon name="plus" className="size-28" />
                    </button>
                </div>

                <dl className="grid grid-1 row-gap-24 size-26 lh-40 mt-24" data-reveal="fade">
                    <div className="flex items-center justify-between flex-wrap column-gap-16">
                        <dt className="purchase-card-page__muted">{t('可用余额')}</dt>
                        <dd className="black">{userReady && user.data ? formatAmount(user.data.usdt_balance) : '--'} USDT</dd>
                    </div>
                    <div className="flex items-center justify-between flex-wrap column-gap-16">
                        <dt className="purchase-card-page__muted">{t('合计')}</dt>
                        <dd className="purchase-card-page__price" aria-live="polite">{totalText} USDT</dd>
                    </div>
                </dl>
                <button type="submit" disabled={submitting || !canPurchase} className="purchase-card-page__submit mt-28">{t('确认购买')}</button>
            </form>

            <ConfirmPopup
                show={showConfirmation}
                title={t('确认购买')}
                confirmText={t('确认购买')}
                submitting={submitting}
                message={(
                    <div className="grid grid-1 row-gap-16">
                        <p>{selectedCard?.name} · {t('{{count}}张', { count: quantity ?? 1 })}</p>
                        <p>{t('合计')}：{totalText} USDT</p>
                    </div>
                )}
                onClose={() => setShowConfirmation(false)}
                onConfirm={purchase}
            />
        </section>
    )
}
