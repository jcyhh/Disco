import { isAddress } from 'viem'

export interface ActivationCardGiftInput {
    address: string
    quantity: string
    ownedCount: number
}

export type ActivationCardGiftValidationError =
    | 'address-required'
    | 'address-invalid'
    | 'quantity-invalid'
    | 'insufficient-cards'

export function validateActivationCardGift({
    address,
    quantity,
    ownedCount,
}: ActivationCardGiftInput): ActivationCardGiftValidationError | undefined {
    const recipient = address.trim()
    if (!recipient) return 'address-required'
    if (!isAddress(recipient, { strict: false })) return 'address-invalid'

    const count = Number(quantity)
    if (!/^\d+$/.test(quantity) || !Number.isSafeInteger(count) || count <= 0) {
        return 'quantity-invalid'
    }
    if (count > ownedCount) return 'insufficient-cards'

    return undefined
}
