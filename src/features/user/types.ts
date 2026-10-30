export interface TeamActivationCard {
    id: number
    name: string
    num: number
    holder_count: number
}

/**
 * User fields that are already confirmed for the template.
 * 当前项目已确认会用到的用户字段。
 */
export interface UserProfile {
    id: number
    address: string
    team_count: number
    kpi: string
    team_kpi: string
    referral_code: string
    referral_count: number
    valid_referral_count: number
    usdt_balance: string
    team_cards: TeamActivationCard[]
}

export interface ReferralUser extends Omit<UserProfile, 'valid_referral_count' | 'usdt_balance' | 'team_cards'> {
    created_at: string
}

export interface BalanceLog {
    id: number
    is_inc: 0 | 1
    amount: string
    content: string
    created_at: string
}
