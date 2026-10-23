import type { Notice } from './types.ts'

type SessionStorage = Pick<Storage, 'getItem' | 'setItem'>
type NoticeVersion = Pick<Notice, 'id' | 'updated_at'>

const READ_STORAGE_KEY = 'disco:mock:notice:read'

export function createNoticeReadSession(
    getStorage: () => SessionStorage | undefined = () => typeof window === 'undefined' ? undefined : window.sessionStorage,
) {
    const memory = new Set<string>()

    function readVersions(): Set<string> {
        const versions = new Set(memory)
        try {
            const raw = getStorage()?.getItem(READ_STORAGE_KEY)
            const stored: unknown = raw ? JSON.parse(raw) : []
            if (Array.isArray(stored)) {
                for (const version of stored) {
                    if (typeof version === 'string') versions.add(version)
                }
            }
        } catch {
            // Optional session storage must not prevent opening or dismissing notices.
        }
        return versions
    }

    function getVersion(notice: NoticeVersion): string {
        return JSON.stringify([notice.id, notice.updated_at])
    }

    return {
        hasRead(notice: NoticeVersion): boolean {
            return readVersions().has(getVersion(notice))
        },
        markRead(notice: NoticeVersion): void {
            const version = getVersion(notice)
            memory.add(version)
            try {
                getStorage()?.setItem(READ_STORAGE_KEY, JSON.stringify([...readVersions()]))
            } catch {
                // Retain the in-memory read state when WebViews block storage writes.
            }
        },
    }
}
