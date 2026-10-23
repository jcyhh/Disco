import { parseAbi, type Address } from 'viem'
import { readDappContract, writeDappContract, writeDappContractWithGas, estimateDappContractGas, createDappContractActions } from '../../src/services/dapp/contract.ts'
import { ERC20_ABI } from '../../src/services/dapp/erc20.ts'
import { DISCO_PROJECT_ABI } from '../../src/services/contracts/discoProjectAbi.ts'
import type { DappBatchCall } from '../../src/services/dapp/types.ts'

const address = '0x0000000000000000000000000000000000000001' as const
function expectType<T>(_value: T): void {}

export function checkContractTypes() {
    const erc20 = createDappContractActions(address, ERC20_ABI)
    expectType<Promise<bigint>>(erc20.read('balanceOf', [address]))
    expectType<Promise<number>>(erc20.read('decimals'))
    expectType<Promise<string>>(erc20.read('symbol'))
    expectType<Promise<bigint>>(readDappContract({ address, abi: ERC20_ABI, functionName: 'balanceOf', args: [address], account: address }))
    expectType<Promise<Address>>(readDappContract({ address, abi: DISCO_PROJECT_ABI, functionName: 'usdt' }))
    expectType<Promise<boolean>>(readDappContract({ address, abi: DISCO_PROJECT_ABI, functionName: 'isBuyCardIdUsed', args: [1n] }))
    void erc20.writeWithGas('approve', [address, 10n], { account: address })
    void erc20.estimateGas('transfer', [address, 10n])
    void writeDappContract({ address, abi: ERC20_ABI, functionName: 'transfer', args: [address, 10n] })

    // @ts-expect-error Method names must exist in the supplied ABI.
    void readDappContract({ address, abi: ERC20_ABI, functionName: 'balancOf', args: [address] })
    // @ts-expect-error A read cannot invoke a state-changing function.
    void readDappContract({ address, abi: ERC20_ABI, functionName: 'approve', args: [address, 1n] })
    // @ts-expect-error Required arguments cannot be omitted.
    void readDappContract({ address, abi: ERC20_ABI, functionName: 'balanceOf' })
    // @ts-expect-error An ABI address parameter cannot receive a number.
    void readDappContract({ address, abi: ERC20_ABI, functionName: 'balanceOf', args: [1] })
    // @ts-expect-error The inferred return type is bigint, not string or any.
    expectType<Promise<string>>(readDappContract({ address, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] }))
    // @ts-expect-error A write cannot invoke a view function.
    void writeDappContract({ address, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] })
    // @ts-expect-error The ERC20 amount is a bigint, not a string.
    void writeDappContractWithGas({ address, abi: ERC20_ABI, functionName: 'approve', args: [address, '10'] })
    // @ts-expect-error Estimates use the same required ABI arguments as writes.
    void estimateDappContractGas({ address, abi: ERC20_ABI, functionName: 'transfer', args: [address] })
    // @ts-expect-error Bound actions retain their ABI function names.
    void erc20.read('missing')
    // @ts-expect-error Bound actions require balanceOf's address argument.
    void erc20.read('balanceOf')
    // @ts-expect-error Bound writes reject incorrect amounts.
    void erc20.write('approve', [address, '10'])
    // @ts-expect-error Bound estimates reject read-only methods.
    void erc20.estimateGas('decimals')
    // @ts-expect-error Project method arguments retain ABI order and types.
    void writeDappContract({ address, abi: DISCO_PROJECT_ABI, functionName: 'joinQueue', args: [1n, 10n, 100n, address, '0x'] })
    // @ts-expect-error Typed batch calls also validate their arguments.
    const invalidBatch: DappBatchCall<typeof ERC20_ABI, 'approve'> = { to: address, abi: ERC20_ABI, functionName: 'approve', args: [address, '10'] }
    void invalidBatch

    const noArguments = parseAbi(['function ping() nonpayable'])
    void createDappContractActions(address, noArguments).write('ping')
}
