import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { ConfirmPopup } from '@/components/ConfirmPopup'
import { Popup } from '@/components/Popup'
import { message } from '@/components/Message'
import { submitWithdraw } from '@/features/withdraw/api.ts'
import type { WithdrawConfig } from '@/features/withdraw/types.ts'
import { useApiMutation } from '@/hooks/useApiMutation.ts'
import { compareDecimalNumbers, multiplyDecimalNumbers, divideDecimalNumbers, subtractDecimalNumbers } from '@/shared/calculations/decimalNumbers.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'

import './WithdrawPopup.scss'

export function WithdrawPopup({ show, balance, address, config, onClose, onSuccess }: {
    show: boolean
    balance: string
    address: string
    config: WithdrawConfig | null
    onClose: () => void
    onSuccess: () => Promise<void>
}) {
    const { t } = useTranslation()
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    const [confirm, setConfirm] = useState(false)
    const { submitting, execute } = useApiMutation()
    const validAmount = /^\d+(?:\.\d{1,18})?$/.test(amount) && compareDecimalNumbers(amount, 0) === 1
    const fee = config && validAmount ? divideDecimalNumbers(multiplyDecimalNumbers(amount, config.fee_rate), 100) : null
    const actual = fee !== null ? subtractDecimalNumbers(amount, fee) : null

    useEffect(() => {
        if (show) { setAmount(''); setError(''); setConfirm(false) }
    }, [show])

    function validate() {
        if (!config || !address) return t('数据未就绪，请刷新后重试')
        if (!validAmount) return t('请输入有效金额，最多十八位小数')
        if (compareDecimalNumbers(amount, config.min_amount) === -1) return t('低于最低提取金额')
        if (compareDecimalNumbers(amount, balance) === 1) return t('余额不足')
        if (actual === null || compareDecimalNumbers(actual, 0) !== 1) return t('到账金额必须大于零')
        return ''
    }

    function review(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const problem = validate()
        setError(problem)
        if (!problem) setConfirm(true)
    }

    function submit() {
        const problem = validate()
        if (problem) { setError(problem); setConfirm(false); return }
        void execute((signal) => submitWithdraw(amount, signal), async () => {
            setConfirm(false)
            onClose()
            message.success(t('提取申请已提交'))
            await onSuccess()
        })
    }

    return <>
        <Popup contentClassName="scroll-y" show={show && !confirm} title={t('提取')} onClose={submitting ? undefined : onClose}>
            <form className="withdraw-popup grid grid-1 row-gap-20 mt-30" noValidate onSubmit={review}>
                <div className="flex flex-column row-gap-10">
                    <div className="flex items-center justify-between flex-wrap column-gap-16 row-gap-4">
                        <label htmlFor="withdraw-amount" className="size-26 lh-40">{t('提取金额')}</label>
                        <span className="withdraw-popup__balance size-24 lh-36 tr">{t('可用余额')}：{formatAmount(balance)} USDT</span>
                    </div>
                    <div className="withdraw-popup__input-box flex items-center">
                        <input id="withdraw-amount" className="withdraw-popup__input flex-1 size-26 lh-40 pr-20" type="text" inputMode="decimal" name="amount" placeholder={t('请输入')} autoComplete="off" value={amount} onChange={(event) => { setAmount(event.target.value); setError('') }} />
                        <button type="button" className="withdraw-popup__all flex-none app-color size-24 lh-36 pl-20" onClick={() => { setAmount(balance); setError('') }}>{t('全部')}</button>
                    </div>
                </div>
                <p className="size-24 lh-36 opc-6">{t('手续费')}：{fee === null ? '0.00' : formatAmount(fee)}USDT</p>
                {error && <p className="red size-24 lh-36" role="alert">{error}</p>}
                <button type="submit" disabled={!config || !address} className="full-btn">{t('下一步')}</button>
            </form>
        </Popup>
        <ConfirmPopup
            show={show && confirm}
            title={t('确认提取')}
            submitting={submitting}
            message={<div className="grid grid-1 row-gap-16"><p>{t('提取金额')}：{formatAmount(amount)} USDT</p><p>{t('手续费')}：{formatAmount(fee)} USDT</p></div>}
            onClose={() => setConfirm(false)}
            onConfirm={submit}
        />
    </>
}
