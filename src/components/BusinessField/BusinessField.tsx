import type { ReactNode } from 'react'
import './BusinessField.scss'

export function BusinessField({ label, children }: { label: string; children: ReactNode }) {
    return <label className="business-field flex flex-column row-gap-10 size-26 lh-40">
        <span>{label}</span>
        {children}
    </label>
}
