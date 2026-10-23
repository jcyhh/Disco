import type {
    Abi,
    Address,
    Chain,
    AbiStateMutability,
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionParameters,
    ContractFunctionReturnType,
    Hash,
    TransactionReceipt,
} from 'viem'

export type DappEthereumProvider = NonNullable<Window['ethereum']>

export interface DappWalletConnection {
    address: Address
    chainId?: number
}

export interface DappSignResult {
    signature: Hash
    timestamp: number
    message: string
}

export interface DappEnsureChainOptions {
    skipInDevelopment?: boolean
}

export interface DappInitializeWalletOptions {
    skipChainInDevelopment?: boolean
    attachListeners?: boolean
}

export interface DappWalletListenerOptions {
    onAccountsChanged?: (address: Address | undefined) => void
    onChainChanged?: (chainId: number | undefined) => void
}

export type DappContractBaseParams<
    TAbi extends Abi = Abi,
    TMutability extends AbiStateMutability = AbiStateMutability,
    TName extends ContractFunctionName<TAbi, TMutability> = ContractFunctionName<TAbi, TMutability>,
> = ContractFunctionParameters<TAbi, TMutability, TName>

export interface DappContractReadOptions {
    account?: Address
}

export type DappContractReadParams<
    TAbi extends Abi = Abi,
    TName extends ContractFunctionName<TAbi, 'view' | 'pure'> = ContractFunctionName<TAbi, 'view' | 'pure'>,
> = DappContractBaseParams<TAbi, 'view' | 'pure', TName> & DappContractReadOptions

export interface DappContractWriteOptions {
    // Optional expected sender. Abort rather than spending from a changed wallet.
    account?: Address
    gas?: bigint
    gasPrice?: bigint
    value?: bigint
}

export type DappContractWriteParams<
    TAbi extends Abi = Abi,
    TName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'> = ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
> = DappContractBaseParams<TAbi, 'nonpayable' | 'payable', TName> & DappContractWriteOptions

type ActionArguments<
    TAbi extends Abi,
    TMutability extends AbiStateMutability,
    TName extends ContractFunctionName<TAbi, TMutability>,
    TOptions,
> = readonly [] extends ContractFunctionArgs<TAbi, TMutability, TName>
    ? [args?: ContractFunctionArgs<TAbi, TMutability, TName>, options?: TOptions]
    : [args: ContractFunctionArgs<TAbi, TMutability, TName>, options?: TOptions]

export interface DappContractActions<TAbi extends Abi = Abi> {
    read<TName extends ContractFunctionName<TAbi, 'view' | 'pure'>>(
        functionName: TName,
        ...params: ActionArguments<TAbi, 'view' | 'pure', TName, DappContractReadOptions>
    ): Promise<ContractFunctionReturnType<TAbi, 'view' | 'pure', TName>>
    write<TName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>>(
        functionName: TName,
        ...params: ActionArguments<TAbi, 'nonpayable' | 'payable', TName, DappContractWriteOptions>
    ): Promise<TransactionReceipt>
    writeWithGas<TName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>>(
        functionName: TName,
        ...params: ActionArguments<TAbi, 'nonpayable' | 'payable', TName, Omit<DappContractWriteOptions, 'gas'>>
    ): Promise<TransactionReceipt>
    estimateGas<TName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>>(
        functionName: TName,
        ...params: ActionArguments<TAbi, 'nonpayable' | 'payable', TName, Pick<DappContractWriteOptions, 'value'>>
    ): Promise<bigint>
}

export type DappBatchCall<
    TAbi extends Abi = Abi,
    TName extends ContractFunctionName<TAbi> = ContractFunctionName<TAbi>,
> = Omit<ContractFunctionParameters<TAbi, AbiStateMutability, TName>, 'address'> & {
    to: Address
    value?: `0x${string}`
}

export interface DappBatchOptions {
    chain?: Chain
    from?: Address
    atomicRequired?: boolean
}
