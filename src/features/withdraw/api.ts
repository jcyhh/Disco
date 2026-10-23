import { request } from '@/services/http'
import type { PageParams } from '../integration/types.ts'
import type { WithdrawConfig, WithdrawRecord } from './types.ts'

export function getWithdrawConfig(signal?: AbortSignal): Promise<WithdrawConfig> {
    return request({ url: '/api/withdraws/config', signal })
}

export function submitWithdraw(amount: string, signal?: AbortSignal): Promise<{ withdraw: WithdrawRecord; balance: string }> {
    return request({ url: '/api/withdraws', method: 'POST', data: { amount }, signal })
}

export async function getWithdraws(params: PageParams & { audit_status?: 1 | 2 | 3; withdraw_status?: 1 | 2 | 3 }, signal?: AbortSignal): Promise<WithdrawRecord[]> {
    const result = await request<{ list: WithdrawRecord[] }>({ url: '/api/withdraws', params, signal })
    return result.list
}
