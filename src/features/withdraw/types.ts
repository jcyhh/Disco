export interface WithdrawConfig {
    fee_rate: string
    min_amount: string
    free_audit_amount: string
}

export interface WithdrawRecord {
    id: number
    ccy: string
    address: string
    amount: string
    fee_rate: string
    fee: string
    actual_amount: string
    audit_status: 1 | 2 | 3
    reject_reason: string
    withdraw_status: 1 | 2 | 3
    tx_hash: string
    expired_at: string
    submitted_at: string
    audited_at: string
    succeed_at: string
    created_at: string
}
