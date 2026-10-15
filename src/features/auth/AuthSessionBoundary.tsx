import type { ReactNode } from 'react'

import { translate } from '../../i18n/index.ts'

export function AuthSessionBoundary({ ready, children }: {
    ready: boolean
    children: ReactNode
}) {
    if (!ready) {
        return <div className="flex-center p-32" role="status">{translate('加载中...')}</div>
    }

    return children
}
