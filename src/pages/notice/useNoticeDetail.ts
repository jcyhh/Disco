import { useCallback, useEffect } from 'react'
import { getNotice, markNoticeRead } from '@/features/notice/api.ts'
import { useApiResource } from '@/hooks/useApiResource.ts'

export function useNoticeDetail(id: number | null) {
    const loader = useCallback((signal: AbortSignal) => id === null ? Promise.resolve(null) : getNotice(id, signal), [id])
    const resource = useApiResource(loader)
    const notice = resource.data
    useEffect(() => {
        if (!notice) return
        const controller = new AbortController()
        void markNoticeRead(notice.id, controller.signal).catch(() => {})
        return () => controller.abort()
    }, [notice])
    return { notice, loading: resource.loading, error: resource.error, reload: resource.reload }
}
