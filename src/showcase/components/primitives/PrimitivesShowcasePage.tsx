import { useState } from 'react'

import { ConfirmPopup } from '@/components/ConfirmPopup'
import { CountdownTimer } from '@/components/CountdownTimer'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import { message } from '@/components/Message/message.ts'
import { ProgressBar } from '@/components/ProgressBar'
import { SecondaryHeader } from '@/components/SecondaryHeader'
import { SegmentedTabs } from '@/components/SegmentedTabs'

const PREVIEW_OPTIONS = [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }]

export function PrimitivesShowcasePage() {
    const [selected, setSelected] = useState('first')
    const [showConfirm, setShowConfirm] = useState(false)
    const [items, setItems] = useState([1, 2, 3])
    const [targetTime] = useState(() => Date.now() + 90000)

    return (
        <div>
            <SecondaryHeader title="Shared primitives" />
            <main className="container">
                <section className="app-card">
                    <h2 className="size-32">Progress</h2>
                    <ProgressBar currentValue={3} totalValue={5} aria-label="Preview progress" className="mt-20" />
                    <h2 className="size-32 mt-30">Controlled tabs</h2>
                    <SegmentedTabs options={PREVIEW_OPTIONS} value={selected} onChange={setSelected} ariaLabel="Preview tabs" />
                    <p className="size-24 mt-20">Selected: {selected}</p>
                    <h2 className="size-32 mt-30">Countdown</h2>
                    <CountdownTimer targetTime={targetTime} className="mt-20" aria-label="Preview countdown" />
                    <button type="button" className="full-btn mt-30" onClick={() => setShowConfirm(true)}>Open confirmation</button>
                    <button type="button" className="full-btn mt-20" onClick={() => message.info('Preview message')}>Show message</button>
                </section>
                <section className="app-card mt-30">
                    <h2 className="size-32">Touch-bottom loading</h2>
                    <InfiniteScroll loading={false} hasMore={items.length < 12} onLoadMore={() => setItems((current) => [...current, current.length + 1])}>
                        {items.map((item) => <p className="size-28 pt-30 pb-30" key={item}>Preview item {item}</p>)}
                    </InfiniteScroll>
                </section>
            </main>
            <ConfirmPopup show={showConfirm} title="Preview" message="Confirm this local preview action?" contentTheme="gradient-card"
                onClose={() => setShowConfirm(false)} onConfirm={() => { setShowConfirm(false); message.success('Confirmed') }} />
        </div>
    )
}
