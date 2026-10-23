import { request } from '@/services/http'
import type { PageParams } from '../integration/types.ts'
import type { ReserveConfig, ReservePayment, ReserveRecord, ReserveSale } from './types.ts'

export function getReserveConfig(signal?: AbortSignal): Promise<ReserveConfig> {
    return request({ url: '/api/reserves/config', signal })
}

export async function getReserves(params: PageParams & { status?: 3 | 4 | 5 | 6 | 7 | 8 }, signal?: AbortSignal): Promise<ReserveRecord[]> {
    const result = await request<{ list: ReserveRecord[] }>({ url: '/api/reserves', params, signal })
    return result.list
}

// Called only inside the complete joinQueue workflow; this request consumes a card.
export function createReserve(amountId: number, signal?: AbortSignal): Promise<ReservePayment> {
    return request({ url: '/api/reserves', method: 'POST', data: { amount_id: amountId }, signal })
}

export function prepareReserveSale(id: number, signal?: AbortSignal): Promise<ReserveSale> {
    return request({ url: '/api/reserves/sell', method: 'POST', data: { id }, signal })
}
