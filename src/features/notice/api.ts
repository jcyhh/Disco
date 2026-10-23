import { request, HttpError } from '@/services/http'
import type { Notice, NoticeListParams, NoticeListResponse, PopNoticeResponse } from './types.ts'

export function getNotices(params: NoticeListParams, signal?: AbortSignal): Promise<NoticeListResponse> {
    return request({ url: '/api/notices', params, signal })
}

export async function getNotice(id: number, signal?: AbortSignal): Promise<Notice | null> {
    try {
        return await request({ url: `/api/notices/${id}`, signal })
    } catch (error) {
        if (error instanceof HttpError && error.status === 404) return null
        throw error
    }
}

export function getPopNotice(signal?: AbortSignal): Promise<PopNoticeResponse> {
    return request({ url: '/api/notices/pop', signal })
}

export function markNoticeRead(id: number, signal?: AbortSignal): Promise<Record<string, never>> {
    return request({ url: `/api/notices/${id}/read`, signal })
}
