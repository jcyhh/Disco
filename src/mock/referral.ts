import { buildRouteHref } from '@/router/navigation.ts'
import { ROUTE_PATH } from '@/router/routes.ts'

export const mockReferralCode = 'DBK6P8'

export function getMockReferralLink(
    origin = typeof window === 'undefined' ? '' : window.location.origin,
): string {
    const path = buildRouteHref(ROUTE_PATH.referral.replace(':ref', encodeURIComponent(mockReferralCode)))
    return origin ? new URL(path, origin).href : path
}
