import type {
    Abi,
    ContractFunctionName,
    ContractFunctionReturnType,
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

export function readDappContract<
    const TAbi extends Abi,
    TName extends ContractFunctionName<TAbi, 'view' | 'pure'>,
>(params: DappContractReadParams<TAbi, TName>): Promise<ContractFunctionReturnType<TAbi, 'view' | 'pure', TName>>
export async function readDappContract({
    address,
    abi,
    functionName,
    args = [],
    account,
}: DappContractReadParams): Promise<unknown> {
    const walletClient = getDappWalletClient()

    const result = await walletClient.readContract({
        address,
        abi,
        functionName,
        args,
        ...(account === undefined ? {} : { account }),
    })

    logDappContractDiagnostic('read', { address, functionName, args, result })
    return result
}

export function estimateDappContractGas<
    const TAbi extends Abi,
    TName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
>(params: DappContractWriteParams<TAbi, TName>): Promise<bigint>
export async function estimateDappContractGas({
    address,
    abi,
    functionName,
    args = [],
    value,
}: DappContractWriteParams): Promise<bigint> {
    const walletClient = getDappWalletClient()
    const account = await getConnectedDappAddress()

    return walletClient.estimateContractGas({
        address,
        abi,
        functionName,
        args,
        account,
        value,
    })
}

export function writeDappContract<
    const TAbi extends Abi,
    TName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
>(params: DappContractWriteParams<TAbi, TName>): Promise<TransactionReceipt>
export async function writeDappContract({
    address,
    abi,
    functionName,
    args = [],
    gas,
    gasPrice,
    value,
    account: expectedAccount,
}: DappContractWriteParams): Promise<TransactionReceipt> {
    return runDappContractWorkflow(async () => {
        await checkDappGasBalance()

        try {
            const walletClient = getDappWalletClient()
            const account = await getConnectedDappAddress()
            if (expectedAccount && expectedAccount.toLowerCase() !== account.toLowerCase()) {
                throw new Error(translateDappErrorMessage(DAPP_ERROR_MESSAGE.walletAddressUnavailable))
            }
            const hash = await walletClient.writeContract({
                address,
                abi,
                functionName,
                args,
                account,
                gas,
                gasPrice,
                value,
            })
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

export function writeDappContractWithGas<
    const TAbi extends Abi,
    TName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
>(params: DappContractWriteParams<TAbi, TName>): Promise<TransactionReceipt>
export async function writeDappContractWithGas(
    params: DappContractWriteParams,
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

export function createDappContractActions<const TAbi extends Abi>(address: Address, abi: TAbi): DappContractActions<TAbi>
export function createDappContractActions(address: Address, abi: Abi): DappContractActions {
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
