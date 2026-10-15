import type {
    Abi,
    Address,
} from 'viem'

import uniswapV2RouterAbi from '../../vendor/uniswapV2Router/abi.json' with { type: 'json' }

import { readDappContract } from './contract.ts'

export const UNISWAP_V2_ROUTER_ABI = uniswapV2RouterAbi as Abi

export function readUniswapV2RouterWeth(
    routerAddress: Address,
): Promise<Address> {
    return readDappContract<Address>({
        address: routerAddress,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'WETH',
    })
}

export function readUniswapV2RouterAmountsOut(
    routerAddress: Address,
    amountIn: bigint,
    path: readonly Address[],
): Promise<readonly bigint[]> {
    return readDappContract<readonly bigint[]>({
        address: routerAddress,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: [amountIn, path],
    })
}

export function readUniswapV2RouterAmountsIn(
    routerAddress: Address,
    amountOut: bigint,
    path: readonly Address[],
): Promise<readonly bigint[]> {
    return readDappContract<readonly bigint[]>({
        address: routerAddress,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'getAmountsIn',
        args: [amountOut, path],
    })
}
