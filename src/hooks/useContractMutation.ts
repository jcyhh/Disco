import { BaseError } from 'viem'
import { translate } from '@/i18n/index.ts'
import { message } from '@/components/Message'
import { HttpError } from '@/services/http/error.ts'
import { useApiMutation } from './useApiMutation.ts'

// Keep API cancellation/session guards, with feedback for errors outside HTTP.
export function useContractMutation() {
    const mutation = useApiMutation()
    return {
        submitting: mutation.submitting,
        execute<T>(task: (signal: AbortSignal) => Promise<T>, onSuccess: (data: T) => Promise<void> | void) {
            return mutation.execute(async (signal) => {
                try {
                    return await task(signal)
                } catch (error) {
                    if (!signal.aborted && !(error instanceof HttpError)) {
                        message.warning(error instanceof BaseError ? error.shortMessage : error instanceof Error ? error.message : translate('交易失败，请重试'))
                    }
                    throw error
                }
            }, onSuccess)
        },
    }
}
