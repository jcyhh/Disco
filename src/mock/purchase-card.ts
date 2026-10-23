import type { ActivationCardValue } from './activation-card.ts'

export interface MockPurchaseCard {
    id: string
    faceValue: ActivationCardValue
    price: string
}

export const mockPurchaseCards: readonly MockPurchaseCard[] = [
    { id: 'purchase-card-10', faceValue: 10, price: '10' },
    { id: 'purchase-card-20', faceValue: 20, price: '20' },
    { id: 'purchase-card-30', faceValue: 30, price: '30' },
]

export const mockPurchaseCardBalance = '2342.983214'
