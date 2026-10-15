import type {
    Abi,
    Address,
    TransactionReceipt,
} from 'viem'

import {
    DAPP_DEFAULT_GAS_PRICE,
    DAPP_ERROR_MESSAGE,
    DAPP_GAS_LIMIT_MULTIPLIER,
    DAPP_MIN_GAS_BALANCE,
    shouldCheckDappGas,
    shouldEstimateDappGas,
    translateDappErrorMessage,
} from './config.ts'
import { logDappContractDiagnostic } from './contractDebug.ts'
import { runDappContractWorkflow } from './contractWorkflow.ts'
import { getDappWalletClient } from './provider.ts'
import { getConnectedDappAddress } from './wallet.ts'
import type {
    DappContractActions,
    DappContractReadOptions,
    DappContractReadParams,
    DappContractWriteOptions,
    DappContractWriteParams,
} from './types.ts'

export async function readDappContract<TResult = unknown, TAbi extends Abi = Abi>({
    address,
    abi,
    functionName,
    args = [],
    account,
}: DappContractReadParams<TAbi>): Promise<TResult> {
    const walletClient = getDappWalletClient()

    const result = await walletClient.readContract({
        address,
        abi,
        functionName,
        args,
        ...(account === undefined ? {} : { account }),
    } as any) as TResult

    logDappContractDiagnostic('read', { address, functionName, args, result })
    return result
}

export async function estimateDappContractGas<TAbi extends Abi = Abi>({
    address,
    abi,
    functionName,
    args = [],
    value,
}: DappContractWriteParams<TAbi>): Promise<bigint> {
    const walletClient = getDappWalletClient()
    const account = await getConnectedDappAddress()

    return walletClient.estimateContractGas({
        address,
        abi,
        functionName,
        args,
        account,
        value,
    } as any)
}

export async function writeDappContract<TAbi extends Abi = Abi>({
    address,
    abi,
    functionName,
    args = [],
    gas,
    gasPrice,
    value,
}: DappContractWriteParams<TAbi>): Promise<TransactionReceipt> {
    return runDappContractWorkflow(async () => {
        await checkDappGasBalance()

        try {
            const walletClient = getDappWalletClient()
            const account = await getConnectedDappAddress()
            const hash = await walletClient.writeContract({
                address,
                abi,
                functionName,
                args,
                account,
                gas,
                gasPrice,
                value,
            } as any)
            const receipt = await walletClient.waitForTransactionReceipt({ hash })

            if (receipt.status === 'reverted') {
                throw new Error(translateDappErrorMessage(DAPP_ERROR_MESSAGE.contractReverted))
            }

            return receipt
        } catch (error) {
            logDappContractDiagnostic('write:failed', { address, functionName, args, value, error })
            throw error
        }
    })
}

export async function writeDappContractWithGas<TAbi extends Abi = Abi>(
    params: DappContractWriteParams<TAbi>,
): Promise<TransactionReceipt> {
    return runDappContractWorkflow(async () => {
        if (!shouldEstimateDappGas()) {
            return writeDappContract(params)
        }

        const estimatedGas = await estimateDappContractGas(params)
        const gas = estimatedGas * DAPP_GAS_LIMIT_MULTIPLIER / 100n

        return writeDappContract({
            ...params,
            gas,
            gasPrice: params.gasPrice ?? DAPP_DEFAULT_GAS_PRICE,
        })
    })
}

export async function checkDappGasBalance(
    minGasBalance: bigint = DAPP_MIN_GAS_BALANCE,
): Promise<bigint> {
    if (!shouldCheckDappGas()) return 0n

    const walletClient = getDappWalletClient()
    const address = await getConnectedDappAddress()
    const balance = await walletClient.getBalance({ address })

    if (balance < minGasBalance) {
        throw new Error(translateDappErrorMessage(DAPP_ERROR_MESSAGE.gasBalanceInsufficient))
    }

    return balance
}

export function createDappContractActions<TAbi extends Abi>(
    address: Address,
    abi: TAbi,
): DappContractActions {
    return {
        read(functionName, args = [], options: DappContractReadOptions = {}) {
            return readDappContract({
                address,
                abi,
                functionName,
                args,
                ...options,
            })
        },
        write(functionName, args = [], options: DappContractWriteOptions = {}) {
            return writeDappContract({
                address,
                abi,
                functionName,
                args,
                ...options,
            })
        },
        writeWithGas(functionName, args = [], options = {}) {
            return writeDappContractWithGas({
                address,
                abi,
                functionName,
                args,
                ...options,
            })
        },
        estimateGas(functionName, args = [], options = {}) {
            return estimateDappContractGas({ address, abi, functionName, args, ...options })
        },
    }
}
