export interface UserStoreState {
    isAuthenticated: boolean
    isSessionReady: boolean
    markSessionReady: () => void
    markSignedIn: () => void
    markSignedOut: () => void
}
