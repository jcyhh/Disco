import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { BusinessField } from '@/components/BusinessField/BusinessField.tsx'
import { Icon } from '@/components/Icon'
import { Picker, type PickerConfirmPayload, type PickerOption } from '@/components/Picker'
import { Popup } from '@/components/Popup'
import { message } from '@/components/Message'
import { reserveWithWallet } from '@/services/contracts/disco.ts'
import { useContractMutation } from '@/hooks/useContractMutation.ts'
import type { ReserveRound } from '@/features/reservation/types.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'

export interface ReserveSelection {
    roundId: number
    amountId: number
}

export function ReservePopup({ show, mode = 'reserve', rounds, selection, onSelect, onClose, onSuccess }: {
    show: boolean
    mode?: 'reserve' | 'amount'
    rounds: ReserveRound[]
    selection: ReserveSelection | null
    onSelect: (selection: ReserveSelection) => void
    onClose: () => void
    onSuccess: () => Promise<void>
}) {
    const { t } = useTranslation()
    const { submitting, execute } = useContractMutation()
    const [roundId, setRoundId] = useState(0)
    const [amountId, setAmountId] = useState(0)
    const [pickerKind, setPickerKind] = useState<'round' | 'amount'>('round')
    const [showPicker, setShowPicker] = useState(false)
    const [pickerIndex, setPickerIndex] = useState(0)
    const round = rounds.find((item) => item.round_id === roundId) ?? rounds[0]
    const amount = round?.amounts.find((item) => item.amount_id === amountId) ?? round?.amounts[0]
    const roundOptions = useMemo<PickerOption[]>(() => rounds.map((item) => ({
        value: item.round_id,
        label: `${(item.name ? t(item.name) : `#${item.round_id}`)} · ${t('{{days}}天', { days: item.days })}`,
    })), [rounds, t])
    const amountOptions = useMemo<PickerOption[]>(() => (round?.amounts ?? []).map((item) => ({
        value: item.amount_id,
        label: `${formatAmount(item.amount)} USDT`,
    })), [round?.amounts])

    useEffect(() => {
        if (!show) { setShowPicker(false); return }
        setRoundId(selection?.roundId ?? 0)
        setAmountId(selection?.amountId ?? 0)
    }, [show, selection?.roundId, selection?.amountId])

    function openPicker(kind: 'round' | 'amount') {
        const options = kind === 'round' ? roundOptions : amountOptions
        const value = kind === 'round' ? round?.round_id : amount?.amount_id
        setPickerKind(kind)
        setPickerIndex(Math.max(0, options.findIndex((option) => option.value === value)))
        setShowPicker(true)
    }

    function confirmPicker({ option }: PickerConfirmPayload) {
        if (typeof option?.value !== 'number') return
        if (pickerKind === 'round') {
            setRoundId(option.value)
            setAmountId(0)
        } else {
            setAmountId(option.value)
        }
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!round || !amount) return
        onSelect({ roundId: round.round_id, amountId: amount.amount_id })
        if (mode === 'amount') onClose()
        else void execute((signal) => reserveWithWallet(amount.amount_id, amount.amount, signal), async () => {
            onClose()
            message.success(t('预约成功'))
            await onSuccess()
        })
    }

    return <><Popup contentClassName="scroll-y" show={show} title={t(mode === 'amount' ? '切换金额' : '立即预约')} onClose={submitting ? undefined : onClose} closeOnOverlayClick={false}>
        <form className="grid grid-1 row-gap-20 mt-30" onSubmit={submit}>
            <BusinessField label={t('预约场次')}>
                <button type="button" className="business-field__picker-trigger flex items-center justify-between column-gap-16 tl" disabled={submitting || !roundOptions.length} aria-haspopup="dialog" aria-expanded={showPicker && pickerKind === 'round'} onClick={() => openPicker('round')}>
                    <span className="flex-1 word-ellipsis-1">{round ? `${(round.name ? t(round.name) : `#${round.round_id}`)} · ${t('{{days}}天', { days: round.days })}` : t('请选择')}</span>
                    <Icon name="arrow-down" className="size-24 flex-none" />
                </button>
            </BusinessField>
            <BusinessField label={t('参与金额')}>
                <button type="button" className="business-field__picker-trigger flex items-center justify-between column-gap-16 tl" disabled={submitting || !amountOptions.length} aria-haspopup="dialog" aria-expanded={showPicker && pickerKind === 'amount'} onClick={() => openPicker('amount')}>
                    <span className="flex-1 word-ellipsis-1">{amount ? `${formatAmount(amount.amount)} USDT` : t('请选择')}</span>
                    <Icon name="arrow-down" className="size-24 flex-none" />
                </button>
            </BusinessField>
            <dl className="grid grid-1 row-gap-16 size-26 lh-40">
                <div className="flex-between"><dt>{t('消耗')}</dt><dd>{(amount?.card_name ? t(amount.card_name) : '') || t('{{value}}＄激活卡', { value: amount?.card_amount ?? '--' })} × 1</dd></div>
                <div className="flex-between"><dt>{t('日收益率')}</dt><dd>{round?.daily_rate ?? '--'}%</dd></div>
                <div className="flex-between"><dt>{t('周期')}</dt><dd>{t('{{days}}天', { days: round?.days ?? 0 })}</dd></div>
            </dl>
            <button type="submit" className="full-btn" disabled={submitting || !amount}>{t(mode === 'amount' ? '确认' : '立即预约')}</button>
        </form>
    </Popup>
        <Picker
            show={show && showPicker}
            title={t(pickerKind === 'round' ? '预约场次' : '参与金额')}
            options={pickerKind === 'round' ? roundOptions : amountOptions}
            value={pickerIndex}
            confirmText={t('确认')}
            onChange={({ index }) => setPickerIndex(index)}
            onConfirm={confirmPicker}
            onClose={() => setShowPicker(false)}
        />
    </>
}
