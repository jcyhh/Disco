import axios from 'axios'

import { message } from '../../components/Message/message.ts'
import { getAuthSessionVersion } from '../../features/auth/lifecycle.ts'
import { APP_CONFIG } from '../../config/index.ts'
import { logout } from '../../features/auth/session.ts'
import { getRequestLanguage } from '../../i18n/getRequestLanguage.ts'
import { isDappEnvironment } from '../platform/runtime.ts'
import { getWalletAddress } from '../storage/common.ts'
import { getToken } from '../storage/token.ts'
import { isFormDataBody } from './body.ts'
import {
    HTTP_AUTH,
    HTTP_CONFIG,
    HTTP_CONTENT_TYPE,
    HTTP_HEADER,
    HTTP_STATUS,
} from './config.ts'
import { toHttpError } from './error.ts'

const requestSessions = new WeakMap<object, { token: string; version: number }>()

export const httpClient = axios.create({
    baseURL: import.meta.env?.VITE_BASE_URL,
    timeout: HTTP_CONFIG.timeout,
})

httpClient.interceptors.request.use((config) => {
    if (APP_CONFIG.enableStaticPageMode) {
        throw new axios.CanceledError('Static page mode disables API requests.', config)
    }

    const token = getToken()
    requestSessions.set(config, { token, version: getAuthSessionVersion() })

    config.headers.set(
        HTTP_HEADER.authorization,
        `${HTTP_AUTH.scheme} ${token}`,
    )

    if (isDappEnvironment()) {
        config.headers.set(HTTP_HEADER.walletAddress, getWalletAddress())
    } else {
        config.headers.delete(HTTP_HEADER.walletAddress)
    }

    if (APP_CONFIG.enableI18n) {
        config.headers.set(HTTP_HEADER.language, getRequestLanguage())
    } else {
        config.headers.delete(HTTP_HEADER.language)
    }

    if (isFormDataBody(config.data)) {
        config.headers.delete(HTTP_HEADER.contentType)
    } else if (config.data !== undefined) {
        config.headers.setContentType(HTTP_CONTENT_TYPE.json)
    }

    return config
})

httpClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        const httpError = toHttpError(error)

        const snapshot = axios.isAxiosError(error) && error.config
            ? requestSessions.get(error.config)
            : undefined
        const belongsToCurrentSession = snapshot?.version === getAuthSessionVersion()
            && snapshot.token === getToken()
        const isUnauthorized = httpError.status === HTTP_STATUS.unauthorized

        if (isUnauthorized && belongsToCurrentSession) {
            logout()
        }

        if (!axios.isCancel(error) && (!isUnauthorized || belongsToCurrentSession)) {
            message.warning(httpError.message)
        }
        return Promise.reject(httpError)
    },
)
