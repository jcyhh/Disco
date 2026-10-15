import { useDappStore } from '../../stores/dapp/store.ts'

export function beginDappContractWorkflow(): () => void {
    return useDappStore.getState().beginContractWorkflow()
}

export async function runDappContractWorkflow<TResult>(
    action: () => Promise<TResult>,
): Promise<TResult> {
    const finish = beginDappContractWorkflow()

    try {
        return await action()
    } finally {
        finish()
    }
}
