import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usdtIconUrl } from '@/assets/tokens'
import { ConfirmPopup } from '@/components/ConfirmPopup'
import { Empty } from '@/components/Empty'
import { SegmentedTabs, type SegmentedTabOption } from '@/components/SegmentedTabs'
import {
    getMockReservationRecords,
    type MockReservationRecord,
    type ReservationStatus,
} from '@/mock'

import './ReservationPage.scss'

const RESERVATION_TABS = [
    { value: 'queued', label: '排队中' },
    { value: 'active', label: '进行中' },
    { value: 'selling', label: '卖出中' },
    { value: 'completed', label: '已完成' },
] as const

interface RecordDetail {
    key: string
    label: string
    value: string
    tone?: 'brand' | 'positive' | 'warning'
}

function ReservationCard({
    record,
    onSell,
}: {
    record: MockReservationRecord
    onSell: (record: MockReservationRecord) => void
}) {
    const { t } = useTranslation()
    const isQueued = record.status === 'queued'
    const isCompleted = record.status === 'completed'
    const canSell = record.status === 'active' || record.status === 'selling'
    const details: RecordDetail[] = [
        {
            key: 'obtain',
            label: isQueued ? '可获得' : '获得',
            value: `${record.obtainAmount} Disco`,
            tone: 'brand',
        },
    ]

    if (record.yieldAmount !== undefined) {
        details.push({
            key: 'yield',
            label: isCompleted ? '收益金额' : '当前收益金额',
            value: `${record.yieldAmount} Disco`,
            tone: 'positive',
        })
    }
    if (record.yieldReduction !== undefined) {
        details.push({
            key: 'reduction',
            label: isCompleted ? '收益减少' : '当前收益减少',
            value: `${record.yieldReduction} Disco`,
            tone: 'warning',
        })
    }
    if (record.yieldRate !== undefined) {
        details.push({
            key: 'rate',
            label: isCompleted ? '收益率' : '当前收益率',
            value: record.yieldRate,
        })
    }
    details.push({
        key: 'duration',
        label: '周期',
        value: isQueued
            ? t('{{days}}天', { days: record.durationDays })
            : t('{{current}}/{{total}}天', {
                current: record.elapsedDays ?? record.durationDays,
                total: record.durationDays,
            }),
    })

    return (
        <article className="reservation-page__card app-card">
            <div className="flex items-start justify-between flex-wrap gap-16 size-24 lh-34">
                <p className="reservation-page__muted">{t('参与金额')}</p>
                <time
                    className="reservation-page__timestamp opc-4"
                    dateTime={record.createdAt.replaceAll('.', '-').replace(' ', 'T')}
                >
                    {record.createdAt}
                </time>
            </div>

            <div className="flex items-center column-gap-10 mt-10">
                <img src={usdtIconUrl} className="img-52 flex-none" alt="" />
                <strong className="size-48 bold-7 lh-72">{record.participationAmount} USDT</strong>
            </div>

            <dl className="reservation-page__details flex flex-column row-gap-20 mt-24 pt-30 size-24 lh-36">
                {details.map((detail) => (
                    <div key={detail.key} className="flex items-start justify-between column-gap-16">
                        <dt className="reservation-page__detail-label reservation-page__muted flex-1">{t(detail.label)}</dt>
                        <dd className={[
                            'reservation-page__detail-value tr bold-5',
                            detail.tone && `reservation-page__detail-value--${detail.tone}`,
                        ].filter(Boolean).join(' ')}>
                            {detail.value}
                        </dd>
                    </div>
                ))}
            </dl>

            {canSell ? (
                <button type="button" className="reservation-page__sell mt-30" onClick={() => onSell(record)}>
                    {t('立即卖出')}
                </button>
            ) : null}
        </article>
    )
}

export function ReservationPage() {
    const { t } = useTranslation()
    const [status, setStatus] = useState<ReservationStatus>('queued')
    const [sellingRecord, setSellingRecord] = useState<MockReservationRecord | null>(null)
    const options = useMemo<SegmentedTabOption<ReservationStatus>[]>(() => (
        RESERVATION_TABS.map((tab) => ({
            value: tab.value,
            label: t(tab.label),
            id: `reservation-tab-${tab.value}`,
            panelId: 'reservation-records-panel',
        }))
    ), [t])
    const records = useMemo(() => getMockReservationRecords(status), [status])

    function closeSaleConfirmation() {
        setSellingRecord(null)
    }

    return (
        <section className="reservation-page container pb-40" data-page="reservation" aria-label={t('预约记录')}>
            <SegmentedTabs
                variant="pills"
                options={options}
                value={status}
                onChange={setStatus}
                ariaLabel={t('预约记录状态')}
            />

            <div
                id="reservation-records-panel"
                className="grid grid-1 row-gap-20 mt-30"
                role="tabpanel"
                tabIndex={0}
                aria-labelledby={`reservation-tab-${status}`}
            >
                {records.length > 0 ? records.map((record) => (
                    <ReservationCard key={record.id} record={record} onSell={setSellingRecord} />
                )) : <Empty />}
            </div>

            <ConfirmPopup
                show={sellingRecord !== null}
                title={t('确认卖出')}
                confirmText={t('确认')}
                message={(
                    <dl className="flex items-start justify-between column-gap-16">
                        <dt className="reservation-page__muted">{t('卖出数量')}</dt>
                        <dd className="reservation-page__detail-value tr bold-5">
                            {sellingRecord?.obtainAmount} Disco
                        </dd>
                    </dl>
                )}
                onClose={closeSaleConfirmation}
                onConfirm={closeSaleConfirmation}
            />
        </section>
    )
}
