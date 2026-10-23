import { getBanners } from '@/features/banner/api.ts'
import { getNotices, getPopNotice } from '@/features/notice/api.ts'
import { getReserveConfig } from '@/features/reservation/api.ts'
import { getPublicConfig } from '@/features/integration/config.ts'

export async function loadHome(signal: AbortSignal) {
    // Public config is currently unused; its latency or failure must not hold up home data.
    void getPublicConfig(signal).catch(() => undefined)
    const [banners, notices, reserves, popup] = await Promise.all([
        getBanners(signal), getNotices({ page_no: 1, page_size: 20 }, signal), getReserveConfig(signal), getPopNotice(signal),
    ])
    return { banners: banners.banners, notices: notices.notices, reserves, popup }
}

