import ownedCard10Url from '@/assets/activation-card/card-10.webp'
import ownedCard20Url from '@/assets/activation-card/card-20.webp'
import ownedCard30Url from '@/assets/activation-card/card-30.webp'
import purchaseCard10Url from '@/assets/purchase-card/card-10.webp'
import purchaseCard20Url from '@/assets/purchase-card/card-20.webp'
import purchaseCard30Url from '@/assets/purchase-card/card-30.webp'

export const ACTIVATION_CARD_OPTIONS = [
    { amount: 10, purchaseImage: purchaseCard10Url, ownedImage: ownedCard10Url },
    { amount: 20, purchaseImage: purchaseCard20Url, ownedImage: ownedCard20Url },
    { amount: 30, purchaseImage: purchaseCard30Url, ownedImage: ownedCard30Url },
] as const

export type ActivationCardAmount = (typeof ACTIVATION_CARD_OPTIONS)[number]['amount']
