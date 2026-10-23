import {
    parseAbi,
    type Abi,
    type Address,
} from 'viem'

import uniswapV2RouterAbi from '../../vendor/uniswapV2Router/abi.json' with { type: 'json' }

import { readDappContract } from './contract.ts'

export const UNISWAP_V2_ROUTER_ABI = uniswapV2RouterAbi as Abi

// JSON imports widen ABI literals; retain exact types for the supported reads.
const ROUTER_READ_ABI = parseAbi([
    'function WETH() view returns (address)',
    'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[])',
    'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[])',
])

export function readUniswapV2RouterWeth(
    routerAddress: Address,
): Promise<Address> {
    return readDappContract({
        address: routerAddress,
        abi: ROUTER_READ_ABI,
        functionName: 'WETH',
    })
}

export function readUniswapV2RouterAmountsOut(
    routerAddress: Address,
    amountIn: bigint,
    path: readonly Address[],
): Promise<readonly bigint[]> {
    return readDappContract({
        address: routerAddress,
        abi: ROUTER_READ_ABI,
        functionName: 'getAmountsOut',
        args: [amountIn, path],
    })
}

export function readUniswapV2RouterAmountsIn(
    routerAddress: Address,
    amountOut: bigint,
    path: readonly Address[],
): Promise<readonly bigint[]> {
    return readDappContract({
        address: routerAddress,
        abi: ROUTER_READ_ABI,
        functionName: 'getAmountsIn',
        args: [amountOut, path],
    })
}
