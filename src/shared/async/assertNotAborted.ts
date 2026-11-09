export function assertNotAborted(signal: AbortSignal): void {
    if (!signal.aborted) return

    // Older WebViews expose aborted but may omit reason.
    const reason = signal.reason
    throw reason === undefined ? new DOMException('The operation was aborted.', 'AbortError') : reason
}
