import { APP_HOME_ROUTE_NAME } from './config.ts'

export const ROUTE_PATH = {
    root: '/',
    referral: '/ref/:ref',
    login: '/login',
    home: `/${APP_HOME_ROUTE_NAME}` as const,
    reservation: '/reservation',
    purchaseCard: '/purchase-card',
    activationCard: '/activation-card',
    asset: '/asset',
    team: '/team',
    invite: '/invite',
    user: '/user',
    notice: '/notice',
    noticeDetail: '/notice/:id',
} as const

export type RoutePath = (typeof ROUTE_PATH)[keyof typeof ROUTE_PATH]
