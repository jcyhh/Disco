import { createNoticeReadSession } from '@/features/notice/session.ts'
import type { Notice, NoticeListParams, NoticeListResponse, PopNoticeResponse } from '@/features/notice/types.ts'

export const mockNotices: readonly Notice[] = [
    {
        id: 1,
        title: '[disco] 正式上线！',
        content: '亲爱的用户：\n\n欢迎来到 Disco，开启属于你的新体验。\n\n首页现已提供预约记录、激活卡、资产和邀请好友等入口。你可以通过侧边栏查看各个页面，也可以在公告列表中阅读最新动态。\n\n感谢你的关注与支持。',
        updated_at: '2026-10-22 10:00',
    },
    {
        id: 2,
        title: '欢迎来到 Disco',
        content: '欢迎来到 Disco。\n\n这里汇集项目动态与使用说明。点击首页公告栏可查看公告列表，点击列表中的公告可阅读全文。',
        updated_at: '2026-10-21 15:30',
    },
    {
        id: 3,
        title: '开启新旅程',
        content: '一起探索 Disco 的精彩世界。\n\n你可以从首页快捷入口进入激活卡、预约记录、我的资产和邀请好友页面。',
        updated_at: '2026-10-20 12:00',
    },
    {
        id: 4,
        title: '项目动态发布说明',
        content: 'Disco 相关动态将通过公告发布。\n\n请留意公告中的发布时间与具体说明，及时了解最新消息。',
        updated_at: '2026-10-19 14:00',
    },
    {
        id: 5,
        title: '功能入口说明',
        content: '点击左上角菜单可以打开侧边栏。\n\n侧边栏提供首页、预约记录、我的激活卡、我的资产、团队和邀请好友六个入口。查看详情时，可以通过顶部返回按钮回到上一页。',
        updated_at: '2026-10-18 11:00',
    },
    {
        id: 6,
        title: '邀请码分享说明',
        content: '团队和邀请好友页面展示同一份邀请资料。\n\n可以复制邀请码与完整邀请链接，也可以在邀请好友页面生成并保存邀请海报。',
        updated_at: '2026-10-17 16:00',
    },
    {
        id: 7,
        title: '资产记录展示说明',
        content: '我的资产页面展示余额与收支明细。\n\n你可以根据记录中的时间、金额和备注了解每笔资产变动。',
        updated_at: '2026-10-16 10:30',
    },
    {
        id: 8,
        title: '语言设置说明',
        content: '可通过右上角语言图标切换界面语言。\n\n选择语言后，界面将切换到对应语言。公告请以所发布的正文内容为准。',
        updated_at: '2026-10-15 13:00',
    },
    {
        id: 9,
        title: '公告阅读说明',
        content: '点击首页公告栏可以打开公告列表。\n\n列表中的公告按时间排列，点击标题可以查看全文。历史公告可随时返回列表阅读。',
        updated_at: '2026-10-14 09:00',
    },
]

const readSession = createNoticeReadSession()

export async function loadMockNotices({ page_no, page_size }: NoticeListParams): Promise<NoticeListResponse> {
    if (![page_no, page_size].every((value) => Number.isSafeInteger(value) && value > 0)) {
        throw new RangeError('Notice pagination requires positive safe integers')
    }
    const start = (page_no - 1) * page_size
    return { notices: mockNotices.slice(start, start + page_size).map((notice) => ({ ...notice })) }
}

export async function loadMockNotice(id: number): Promise<Notice | null> {
    if (!Number.isSafeInteger(id) || id <= 0) return null
    const notice = mockNotices.find((entry) => entry.id === id)
    return notice ? { ...notice } : null
}

export function markMockNoticeRead(id: number): void {
    const notice = mockNotices.find((entry) => entry.id === id)
    if (notice) readSession.markRead(notice)
}

export async function loadMockPopNotice(): Promise<PopNoticeResponse> {
    const notice = mockNotices[0]
    if (!notice || readSession.hasRead(notice)) return { is_show: false, notice: [] }
    return { is_show: true, notice: { ...notice } }
}
