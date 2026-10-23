import activationCardIconUrl from '@/assets/layout/menu/activation-card.png'
import assetIconUrl from '@/assets/layout/menu/asset.png'
import homeIconUrl from '@/assets/layout/menu/home.png'
import inviteIconUrl from '@/assets/layout/menu/invite.png'
import purchaseCardIconUrl from '@/assets/layout/menu/purchase-card.png'
import reservationIconUrl from '@/assets/layout/menu/reservation.png'
import teamIconUrl from '@/assets/layout/menu/team.png'
import { ROUTE_PATH } from '@/router/routes'

export type MainPageItemPath =
    | typeof ROUTE_PATH.home
    | typeof ROUTE_PATH.reservation
    | typeof ROUTE_PATH.purchaseCard
    | typeof ROUTE_PATH.activationCard
    | typeof ROUTE_PATH.asset
    | typeof ROUTE_PATH.team
    | typeof ROUTE_PATH.invite

export type MainPageItem = {
    path: MainPageItemPath
    title: string
    icon: string
    activeIcon: string
}

export const MAIN_PAGE_ITEMS: readonly MainPageItem[] = [
    {
        path: ROUTE_PATH.home,
        title: '首页',
        icon: homeIconUrl,
        activeIcon: homeIconUrl,
    },
    {
        path: ROUTE_PATH.reservation,
        title: '预约记录',
        icon: reservationIconUrl,
        activeIcon: reservationIconUrl,
    },
    {
        path: ROUTE_PATH.purchaseCard,
        title: '购买激活卡',
        icon: purchaseCardIconUrl,
        activeIcon: purchaseCardIconUrl,
    },
    {
        path: ROUTE_PATH.activationCard,
        title: '我的激活卡',
        icon: activationCardIconUrl,
        activeIcon: activationCardIconUrl,
    },
    {
        path: ROUTE_PATH.asset,
        title: '我的资产',
        icon: assetIconUrl,
        activeIcon: assetIconUrl,
    },
    {
        path: ROUTE_PATH.team,
        title: '团队',
        icon: teamIconUrl,
        activeIcon: teamIconUrl,
    },
    {
        path: ROUTE_PATH.invite,
        title: '邀请好友',
        icon: inviteIconUrl,
        activeIcon: inviteIconUrl,
    },
]
