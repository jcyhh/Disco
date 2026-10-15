export type ReservationStatus = 'queued' | 'active' | 'selling' | 'completed'

export interface MockReservationRecord {
    id: string
    status: ReservationStatus
    createdAt: string
    participationAmount: string
    obtainAmount: string
    yieldAmount?: string
    yieldReduction?: string
    yieldRate?: string
    elapsedDays?: number
    durationDays: number
}

const displayValues = {
    createdAt: '2026.02.24 12:28',
    participationAmount: '100',
    obtainAmount: '12,345.80',
    durationDays: 5,
} as const

export const mockReservationRecords: readonly MockReservationRecord[] = [
    ...Array.from({ length: 4 }, (_, index) => ({
        ...displayValues,
        id: `reservation-queued-${index + 1}`,
        status: 'queued' as const,
    })),
    ...Array.from({ length: 3 }, (_, index) => ({
        ...displayValues,
        id: `reservation-active-${index + 1}`,
        status: 'active' as const,
        yieldAmount: '45.80',
        yieldRate: '20%',
        elapsedDays: 2,
    })),
    ...Array.from({ length: 3 }, (_, index) => ({
        ...displayValues,
        id: `reservation-selling-${index + 1}`,
        status: 'selling' as const,
        yieldAmount: '45.80',
        yieldReduction: '21.46',
        yieldRate: '20%',
        elapsedDays: 5,
    })),
    ...Array.from({ length: 3 }, (_, index) => ({
        ...displayValues,
        id: `reservation-completed-${index + 1}`,
        status: 'completed' as const,
        yieldAmount: '45.80',
        yieldRate: '20%',
        elapsedDays: 5,
        ...(index === 0 ? { yieldReduction: '21.46' } : {}),
    })),
]

export function getMockReservationRecords(
    status: ReservationStatus,
    records: readonly MockReservationRecord[] = mockReservationRecords,
): MockReservationRecord[] {
    return records.filter((record) => record.status === status)
}
