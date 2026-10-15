export type ActivationCardValue = 10 | 20 | 30

export interface MockActivationCard {
    id: string
    faceValue: ActivationCardValue
    ownedCount: number
}

export const mockActivationCards: readonly MockActivationCard[] = [
    { id: 'card-10', faceValue: 10, ownedCount: 10 },
    { id: 'card-20', faceValue: 20, ownedCount: 2 },
    { id: 'card-30', faceValue: 30, ownedCount: 0 },
]

export interface MockActivationCardRecord {
    id: string
    faceValue: ActivationCardValue
    createdAt: string
}

export const mockActivationCardRecords: readonly MockActivationCardRecord[] = (
    [10, 20, 30, 10, 20, 30, 10, 20] as const
).map((faceValue, index) => ({
    id: `activation-card-record-${index + 1}`,
    faceValue,
    createdAt: '2025.08.26 12:24',
}))

export function getActivationCardRecords(
    expanded = false,
    records: readonly MockActivationCardRecord[] = mockActivationCardRecords,
): MockActivationCardRecord[] {
    return records.slice(0, expanded ? records.length : 4)
}
