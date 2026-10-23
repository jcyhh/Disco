import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getAuthSessionVersion } from '@/features/auth/lifecycle.ts'
import { useLatestRequest } from './useLatestRequest.ts'

export function useApiResource<T>(loader: (signal: AbortSignal) => Promise<T>) {
    const { i18n } = useTranslation()
    const [state, setState] = useState<{ loader: typeof loader; data: T | null; loading: boolean; error: boolean }>({ loader, data: null, loading: true, error: false })
    const controller = useRef<AbortController | null>(null)
    const { createLatestRequestGuard, invalidateLatestRequest } = useLatestRequest()

    const reload = useCallback(async () => {
        controller.current?.abort()
        const currentController = new AbortController()
        controller.current = currentController
        const guard = createLatestRequestGuard()
        const session = getAuthSessionVersion()
        const isCurrent = () => guard() && !currentController.signal.aborted && session === getAuthSessionVersion()
        setState((current) => ({ loader, data: current.loader === loader ? current.data : null, loading: true, error: false }))
        try {
            const data = await loader(currentController.signal)
            if (isCurrent()) setState({ loader, data, loading: false, error: false })
        } catch {
            if (isCurrent()) setState((current) => ({ ...current, loading: false, error: true }))
        }
    }, [createLatestRequestGuard, loader])

    useEffect(() => {
        void reload()
        return () => { controller.current?.abort(); invalidateLatestRequest() }
    }, [reload, i18n.language, invalidateLatestRequest])

    return { ...(state.loader === loader ? state : { data: null, loading: true, error: false }), reload }
}
