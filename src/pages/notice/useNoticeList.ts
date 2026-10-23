import { getNotices } from '@/features/notice/api.ts'
import { useApiList } from '@/hooks/useApiList.ts'

const loadNotices = async (params: { page_no: number; page_size: number }, signal: AbortSignal) => (await getNotices(params, signal)).notices

export function useNoticeList() {
    const list = useApiList(loadNotices)
    return { ...list, notices: list.items }
}
