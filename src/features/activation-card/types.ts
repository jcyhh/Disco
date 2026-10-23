export interface ActivationCard {
    id: number
    name: string
    amount: string
    num: number
}

export interface ActivationCardLog {
    id: number
    card_id: number
    card_name: string
    amount: string
    is_inc: 0 | 1
    num: number
    after_num: number
    content: string
    from_address: string
    created_at: string
}

export interface CardPayment {
    id: number
    card_id: number
    num: number
    amount: string
    recipient: string
    deadline: number
    sign: string
}
