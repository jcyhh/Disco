import { request } from '@/services/http'

export function getPublicConfig(signal?: AbortSignal): Promise<Record<string, unknown>> {
    return request({ url: '/api/config/config', signal })
}

