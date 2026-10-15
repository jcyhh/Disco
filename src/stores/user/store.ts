import { create } from 'zustand'

import { APP_CONFIG } from '../../config/index.ts'
import { getToken } from '../../services/storage/token.ts'

import type { UserStoreState } from './types.ts'

export const useUserStore = create<UserStoreState>()((set) => ({
    isAuthenticated: APP_CONFIG.enableStaticPageMode || Boolean(getToken()),
    isSessionReady: APP_CONFIG.enableStaticPageMode || !getToken(),
    markSessionReady: () => set({ isSessionReady: true }),
    markSignedIn: () => set({ isAuthenticated: true, isSessionReady: true }),
    markSignedOut: () => set({ isAuthenticated: APP_CONFIG.enableStaticPageMode, isSessionReady: true }),
}))
