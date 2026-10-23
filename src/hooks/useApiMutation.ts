import { useEffect, useRef, useState } from 'react'

import { getAuthSessionVersion } from '@/features/auth/lifecycle.ts'

export function useApiMutation() {
    const [submitting, setSubmitting] = useState(false)
    const pending = useRef(false)
    const mounted = useRef(false)
    const controller = useRef<AbortController | null>(null)

    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false; controller.current?.abort() }
    }, [])

    async function execute<T>(task: (signal: AbortSignal) => Promise<T>, onSuccess: (data: T) => Promise<void> | void) {
        if (pending.current) return
        pending.current = true
        setSubmitting(true)
        const session = getAuthSessionVersion()
        const currentController = new AbortController()
        controller.current = currentController
        try {
            const data = await task(currentController.signal)
            if (mounted.current && !currentController.signal.aborted && session === getAuthSessionVersion()) await onSuccess(data)
        } catch {
            // Shared HTTP feedback reports errors. Keep the user's form for an explicit retry.
        } finally {
            pending.current = false
            if (mounted.current) setSubmitting(false)
        }
    }

    return { submitting, execute }
}
