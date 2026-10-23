export function getCardArt<T extends string>(amount: string, images: Record<10 | 20 | 30, T>): T | undefined {
    const value = Number(amount)
    return value === 10 || value === 20 || value === 30 ? images[value] : undefined
}
