export interface ReserveAmount {
    amount_id: number
    amount: string
    card_id: number
    card_name: string
    card_amount: string
}

export interface ReserveRound {
    round_id: number
    name: string
    days: number
    daily_rate: string
    amounts: ReserveAmount[]
}

export interface ReserveConfig {
    disco_price: string
    list: ReserveRound[]
}

export interface ReserveRecord {
    id: number
    round_id: number
    round_name: string
    amount_id: number
    amount: string
    card_id: number
    card_name: string
    days: number
    passed_days: number
    daily_rate: string
    disco_price: string
    token_amount: string
    expect_token_amount: string
    profit_amount: string
    reduced_profit: string
    rise_rate: string
    remain_profit: string
    can_sell: boolean
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    token_status: 1 | 2 | 3
    sell_status: 1 | 2 | 3
    tx_hash: string
    running_at: string
    selling_at: string
    sell_usdt_amount: string
    sell_user_amount: string
    sell_leader_amount: string
    sold_at: string
    paid_at: string
    created_at: string
}

export interface ReservePayment {
    id: number
    amount: string
    recipient: string
    deadline: number
    sign: string
}

export interface ReserveSale {
    id: number
    token_amount: string
    usdt_amount: string
    leader_address: string
    leader_amount: string
    deadline: number
    sign: string
}
