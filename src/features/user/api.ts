import { request } from '../../services/http/request.ts'

import type { BalanceLog, ReferralUser, UserProfile } from './types.ts'
import type { PageParams } from '../integration/types.ts'

/**
 * Get the current signed-in user.
 * 获取当前登录用户。
 */
export function getCurrentUser(signal?: AbortSignal): Promise<UserProfile> {
    return request<UserProfile>({
        url: '/api/users/my',
        method: 'GET',
        signal,
    })
}

export function updateCurrentUser(data: { avatar_url?: string; name?: string }, signal?: AbortSignal): Promise<UserProfile> {
    return request({ url: '/api/users/my', method: 'POST', data, signal })
}

export async function getReferrals(params: PageParams, signal?: AbortSignal): Promise<ReferralUser[]> {
    const result = await request<{ referrals: ReferralUser[] }>({ url: '/api/users/my/referrals', params, signal })
    return result.referrals
}

export async function getBalanceLogs(params: PageParams, signal?: AbortSignal): Promise<BalanceLog[]> {
    const result = await request<{ list: BalanceLog[] }>({ url: '/api/users/my/balance_logs', params: { ...params, ccy: 'usdt_balance' }, signal })
    return result.list
}
