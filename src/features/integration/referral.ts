import { buildRouteHref } from '@/router/navigation.ts'
import { ROUTE_PATH } from '@/router/routes.ts'

export function getReferralLink(code: string): string {
    if (!code) return ''
    return new URL(buildRouteHref(ROUTE_PATH.referral.replace(':ref', encodeURIComponent(code))), window.location.origin).href
}
