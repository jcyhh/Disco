export function resolveApiAssetUrl(value: string): string {
    if (!value) return ''
    try {
        const base = import.meta.env?.PROD ? window.location.origin : import.meta.env?.VITE_BASE_URL || window.location.origin
        const url = new URL(value, base)
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
    } catch {
        return ''
    }
}
