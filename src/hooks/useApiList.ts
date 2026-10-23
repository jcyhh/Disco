import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getAuthSessionVersion } from '@/features/auth/lifecycle.ts'
import type { PageParams } from '@/features/integration/types.ts'
import { useLatestRequest } from './useLatestRequest.ts'

const PAGE_SIZE = 20

export function useApiList<T extends { id: number | string }>(loader: (params: PageParams, signal: AbortSignal) => Promise<T[]>) {
    const { i18n } = useTranslation()
    const [state, setState] = useState({ loader, items: [] as T[], loading: true, error: false, hasMore: false })
    const page = useRef(0)
    const more = useRef(false)
    const failed = useRef<{ page: number; replace: boolean } | null>(null)
    const pending = useRef<Promise<void> | null>(null)
    const controller = useRef<AbortController | null>(null)
    const { createLatestRequestGuard, invalidateLatestRequest } = useLatestRequest()

    const loadPage = useCallback((pageNo: number, replace: boolean): Promise<void> => {
        controller.current?.abort()
        const currentController = new AbortController()
        controller.current = currentController
        const guard = createLatestRequestGuard()
        const session = getAuthSessionVersion()
        const isCurrent = () => guard() && !currentController.signal.aborted && session === getAuthSessionVersion()
        setState((current) => ({ ...current, loader, items: replace ? [] : current.items, loading: true, error: false }))
        const work = (async () => {
            try {
                const items = await loader({ page_no: pageNo, page_size: PAGE_SIZE }, currentController.signal)
                if (!isCurrent()) return
                page.current = pageNo
                more.current = items.length === PAGE_SIZE
                failed.current = null
                setState((current) => ({
                    loader,
                    items: replace ? items : [...new Map([...current.items, ...items].map((item) => [item.id, item])).values()],
                    loading: false,
                    error: false,
                    hasMore: more.current,
                }))
            } catch {
                if (isCurrent()) {
                    failed.current = { page: pageNo, replace }
                    setState((current) => ({ ...current, loading: false, error: true }))
                }
            } finally {
                if (isCurrent()) pending.current = null
            }
        })()
        pending.current = work
        return work
    }, [createLatestRequestGuard, loader])

    const reload = useCallback(() => loadPage(1, true), [loadPage])
    const loadMore = useCallback(() => {
        if (pending.current) return pending.current
        return more.current ? loadPage(page.current + 1, false) : Promise.resolve()
    }, [loadPage])
    const retry = useCallback(() => {
        if (pending.current) return pending.current
        return failed.current ? loadPage(failed.current.page, failed.current.replace) : reload()
    }, [loadPage, reload])

    useEffect(() => {
        page.current = 0
        more.current = false
        void reload()
        return () => { controller.current?.abort(); pending.current = null; invalidateLatestRequest() }
    }, [reload, i18n.language, invalidateLatestRequest])

    return { ...(state.loader === loader ? state : { items: [] as T[], loading: true, error: false, hasMore: false }), reload, loadMore, retry }
}
