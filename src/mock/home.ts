import type { Banner } from '@/features/banner/types.ts'
import type { Notice } from '@/features/notice/types.ts'

import bannerUrl from './assets/banner.webp'
import { mockNotices } from './notice.ts'

export type MockHomeAnnouncement = Notice

export const mockHomeBanners: readonly Banner[] = [
    { id: 'home-banner-1', img_url: bannerUrl },
    { id: 'home-banner-2', img_url: bannerUrl },
    { id: 'home-banner-3', img_url: bannerUrl },
]

export const mockHomeAnnouncements: readonly MockHomeAnnouncement[] = mockNotices.slice(0, 3)

export const mockHomeExploration = {
    round: '第一轮',
    amount: '100',
    token: 'USDT',
    activationCardPrice: '10',
    activationCardCount: 1,
    dailyYield: '20%',
    durationDays: 5,
} as const

export const mockHomeTokenOverview = {
    totalSupply: '10亿枚',
    initialPool: '10,000',
    initialPrice: '0.001',
    circulation: '1%',
    deflation: '99%',
} as const
