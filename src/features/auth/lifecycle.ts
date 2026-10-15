const logoutCleanups = new Set<() => void>()

export function registerAuthLogoutCleanup(cleanup: () => void): () => void {
    logoutCleanups.add(cleanup)

    return () => {
        logoutCleanups.delete(cleanup)
    }
}

export function runAuthLogoutCleanups(): void {
    const cleanups = [...logoutCleanups]
    logoutCleanups.clear()

    cleanups.forEach((cleanup) => cleanup())
}

let authSessionVersion = 0

export function getAuthSessionVersion(): number {
    return authSessionVersion
}

export function invalidateAuthSession(): void {
    authSessionVersion += 1
}
