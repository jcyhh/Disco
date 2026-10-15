export function normalizeRouteBase(value: string): string {
    const segments = value.trim().split('/').filter(Boolean)
    return segments.length ? `/${segments.join('/')}/` : '/'
}

export const APP_DEPLOYMENT = {
    routeBase: normalizeRouteBase('/h5/'),
} as const

export function getRouterBasename(routeBase: string): string {
    return normalizeRouteBase(routeBase).replace(/\/$/, '')
}
