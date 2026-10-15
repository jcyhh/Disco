import type { Banner } from '@/features/banner/types.ts'

import bannerUrl from './assets/banner.webp'

export interface MockHomeAnnouncement {
    id: string
    title: string
    content: string
}

export const mockHomeBanners: readonly Banner[] = [
    { id: 'home-banner-1', img_url: bannerUrl },
    { id: 'home-banner-2', img_url: bannerUrl },
    { id: 'home-banner-3', img_url: bannerUrl },
]

export const mockHomeAnnouncements: readonly MockHomeAnnouncement[] = [
    {
        id: 'launch',
        title: '[disco] 正式上线！',
        content: '[disco] 正式上线！亲爱的用户：为了给您提供更加优质、便捷、丰富的功能，欢迎体验 Disco。',
    },
    {
        id: 'welcome',
        title: '欢迎来到 Disco',
        content: '欢迎来到 Disco，开启属于你的新体验。',
    },
    {
        id: 'exploration',
        title: '开启新旅程',
        content: '每一次参与，获得更多收益。一起探索 Disco 的精彩世界。',
    },
]

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
