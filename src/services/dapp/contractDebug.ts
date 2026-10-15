import { DAPP_CONFIG } from './config.ts'

export function logDappContractDiagnostic(
    operation: 'read' | 'write:failed',
    details: Record<string, unknown>,
    enabled = DAPP_CONFIG.enableContractDebug,
): void {
    if (!enabled) return

    try {
        const seen = new WeakSet<object>()
        const serialized = JSON.stringify(details, (_key, value: unknown) => {
            if (typeof value === 'bigint') return value.toString()
            if (value instanceof Error) return value.message
            if (value && typeof value === 'object') {
                if (seen.has(value)) return '[Circular]'
                seen.add(value)
            }
            return value
        })
        const output = operation === 'write:failed' ? console.error : console.debug
        output(`[contract:${operation}]`, serialized)
    } catch {
        // Diagnostics must never change a contract call's result or error.
    }
}
