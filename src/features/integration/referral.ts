import { ROUTE_PATH } from '../../router/routes.ts'

export function getReferralLink(code: string): string {
    if (!code) return ''
    const path = ROUTE_PATH.referral.replace(':ref', encodeURIComponent(code))
    return new URL(path, window.location.origin).href
}
