import { request } from '@/services/http'
import type { PageParams } from '../integration/types.ts'
import type { ActivationCard, ActivationCardLog, CardPayment } from './types.ts'

export async function getActivationCards(signal?: AbortSignal): Promise<ActivationCard[]> {
    const result = await request<{ list: ActivationCard[] }>({ url: '/api/activation_cards', signal })
    return result.list
}

export async function getActivationCardLogs(params: PageParams & { card_id?: number }, signal?: AbortSignal): Promise<ActivationCardLog[]> {
    const result = await request<{ list: ActivationCardLog[] }>({ url: '/api/activation_cards/logs', params, signal })
    return result.list
}

export function giftActivationCard(data: { address: string; card_id: number; num: number }, signal?: AbortSignal): Promise<Record<string, never>> {
    return request({ url: '/api/activation_cards/gift', method: 'POST', data, signal })
}

export function prepareCardPurchase(data: { card_id: number; num: number }, signal?: AbortSignal): Promise<CardPayment> {
    return request({ url: '/api/activation_cards/buy', method: 'POST', data, signal })
}
