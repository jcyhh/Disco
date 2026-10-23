export function parsePurchaseQuantity(value: string): number | null {
    if (!/^\d+$/.test(value)) return null
    const quantity = Number(value)
    return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null
}
