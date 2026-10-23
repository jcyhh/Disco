export interface Notice {
    id: number
    title: string
    content: string
    updated_at: string
}

export interface NoticeListParams {
    page_no: number
    page_size: number
}

export interface NoticeListResponse {
    notices: Notice[]
}

export interface PopNoticeResponse {
    is_show: boolean
    notice: Notice | [] | null
}
