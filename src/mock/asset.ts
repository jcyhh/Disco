export const mockAssetOverview = {
    symbol: 'disco',
    balance: '8,864.980324',
} as const

export interface MockAssetRecord {
    id: string
    direction: 'income' | 'expense'
    amount: string
    symbol: string
    createdAt: string
}

export const mockAssetRecords: readonly MockAssetRecord[] = [
    { id: 'asset-1', direction: 'income', amount: '+4,548', symbol: 'Disco', createdAt: '2025-01-20 12:28' },
    { id: 'asset-2', direction: 'income', amount: '+4,548', symbol: 'Disco', createdAt: '2025-01-20 12:28' },
    { id: 'asset-3', direction: 'expense', amount: '-0.849372', symbol: 'Disco', createdAt: '2025-01-20 12:28' },
    { id: 'asset-4', direction: 'income', amount: '+4,548', symbol: 'Disco', createdAt: '2025-01-20 12:28' },
    { id: 'asset-5', direction: 'expense', amount: '-0.849372', symbol: 'Disco', createdAt: '2025-01-20 12:28' },
    { id: 'asset-6', direction: 'income', amount: '+4,548', symbol: 'Disco', createdAt: '2025-01-20 12:28' },
]
