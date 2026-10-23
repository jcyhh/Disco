import { usePageReveal } from '@/hooks/usePageReveal.ts'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usdtIconUrl } from '@/assets/tokens'
import { ApiListFooter } from '@/components/ApiState/ApiState.tsx'
import { ConfirmPopup } from '@/components/ConfirmPopup'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { SegmentedTabs, type SegmentedTabOption } from '@/components/SegmentedTabs'
import { message } from '@/components/Message'
import { sellReserveWithWallet } from '@/services/contracts/disco.ts'
import { useContractMutation } from '@/hooks/useContractMutation.ts'
import type { PageParams } from '@/features/integration/types.ts'
import { getReserves } from '@/features/reservation/api.ts'
import type { ReserveRecord } from '@/features/reservation/types.ts'
import { useApiList } from '@/hooks/useApiList.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'

import './ReservationPage.scss'

const RESERVATION_TABS = [
    { value: '3', label: '排队中' },
    { value: '4', label: '进行中' },
    { value: '6', label: '卖出中' },
    { value: '8', label: '已完成' },
] as const

type Status = typeof RESERVATION_TABS[number]['value']

function ReservationCard({ record, onSell }: { record: ReserveRecord; onSell: (record: ReserveRecord) => void }) {
    const { t } = useTranslation()
    const queued = record.status === 3
    const active = record.status === 4 || record.status === 5
    const completed = record.status === 8
    const waitingForTokens = queued || record.token_status !== 3
    const details = [
        { key: 'obtain', label: waitingForTokens ? '可获得' : '获得', value: `${formatAmount(waitingForTokens ? record.expect_token_amount : record.token_amount)} DISCO`, tone: 'brand' },
        ...(!queued ? [
            { key: 'profit', label: completed ? '收益金额' : '当前收益金额', value: `${formatAmount(completed || active ? record.profit_amount : record.remain_profit)} USDT`, tone: 'positive' },
            ...(!active ? [{ key: 'reduction', label: completed ? '收益减少' : '当前收益减少', value: `${formatAmount(record.reduced_profit)} USDT`, tone: 'warning' }] : []),
            { key: 'rate', label: '当前收益率', value: `${formatAmount(record.rise_rate)}%`, tone: '' },
        ] : []),
        { key: 'duration', label: '周期', value: queued ? t('{{days}}天', { days: record.days }) : t('{{current}}/{{total}}天', { current: record.passed_days, total: record.days }), tone: '' },
    ]
    const canSell = record.can_sell && record.status === 6

    return <article className="reservation-page__card app-card" data-reveal="rise">
        <div className="flex items-start justify-between flex-wrap gap-16 size-24 lh-34">
            <p className="reservation-page__muted">{t('参与金额')}</p>
            <time className="reservation-page__timestamp opc-4" dateTime={record.created_at.replace(' ', 'T')}>{record.created_at}</time>
        </div>
        <div className="flex items-center column-gap-10 mt-10">
            <img src={usdtIconUrl} className="img-52 flex-none" alt="" />
            <strong className="size-48 bold-7 lh-72">{formatAmount(record.amount)} USDT</strong>
        </div>
        <dl className="reservation-page__details flex flex-column row-gap-20 mt-24 pt-30 size-24 lh-36">
            {details.map((detail) => <div key={detail.key} className="flex items-start justify-between column-gap-16">
                <dt className="reservation-page__detail-label reservation-page__muted flex-1">{t(detail.label)}</dt>
                <dd className={`reservation-page__detail-value tr bold-5 ${detail.tone ? `reservation-page__detail-value--${detail.tone}` : ''}`}>{detail.value}</dd>
            </div>)}
        </dl>
        {canSell && <button type="button" className="reservation-page__sell mt-30" onClick={() => onSell(record)}>{t('立即卖出')}</button>}
    </article>
}

export function ReservationPage() {
    const pageRef = usePageReveal<HTMLElement>()
    const { t } = useTranslation()
    const { submitting, execute } = useContractMutation()
    const [status, setStatus] = useState<Status>('3')
    const [sellingRecord, setSellingRecord] = useState<ReserveRecord | null>(null)
    const loader = useCallback((params: PageParams, signal: AbortSignal) => getReserves({ ...params, status: Number(status) as 3 | 4 | 6 | 8 }, signal), [status])
    const list = useApiList(loader)
    usePageRefresh(list.reload, !sellingRecord && !submitting)
    const options = useMemo<SegmentedTabOption<Status>[]>(() => RESERVATION_TABS.map((tab) => ({ ...tab, label: t(tab.label), id: `reservation-tab-${tab.value}`, panelId: 'reservation-records-panel' })), [t])

    function sell() {
        if (!sellingRecord || !sellingRecord.can_sell || sellingRecord.status !== 6) return
        void execute((signal) => sellReserveWithWallet(sellingRecord.id, signal), async () => {
            setSellingRecord(null)
            message.success(t('卖出成功'))
            await list.reload()
        })
    }

    return <section ref={pageRef} className="reservation-page container pb-40" data-page="reservation" aria-label={t('预约记录')}>
        <SegmentedTabs data-reveal="fade" variant="pills" options={options} value={status} onChange={setStatus} ariaLabel={t('预约记录状态')} />
        <div id="reservation-records-panel" className="grid grid-1 row-gap-20 mt-30" role="tabpanel" tabIndex={0} aria-labelledby={`reservation-tab-${status}`}>
            {list.items.map((record) => <ReservationCard key={record.id} record={record} onSell={setSellingRecord} />)}
        </div>
        <ApiListFooter {...list} />
        <ConfirmPopup
            show={sellingRecord !== null}
            title={t('确认卖出')}
            confirmText={t('确认卖出')}
            submitting={submitting}
            message={<div className="grid grid-1 row-gap-16"><p>{t('卖出数量')}：{formatAmount(sellingRecord?.token_amount)} DISCO</p><p>{t('当前可卖出收益')}：{formatAmount(sellingRecord?.remain_profit)} USDT</p></div>}
            onClose={() => setSellingRecord(null)}
            onConfirm={sell}
        />
    </section>
}
