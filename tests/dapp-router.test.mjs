import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { UNISWAP_V2_ROUTER_ABI } from '../src/services/dapp/index.ts'

function getAbiFunctionNames(abi) {
    return abi
        .filter((item) => item.type === 'function')
        .map((item) => item.name)
}

test('dapp module exposes the common Uniswap V2 router ABI', () => {
    const functionNames = getAbiFunctionNames(UNISWAP_V2_ROUTER_ABI)
    const source = readFileSync('src/services/dapp/uniswapV2Router.ts', 'utf8')
    const entry = readFileSync('src/services/dapp/index.ts', 'utf8')
    const contractsReadme = readFileSync('src/services/contracts/README.md', 'utf8')

    assert.equal(Array.isArray(UNISWAP_V2_ROUTER_ABI), true)
    assert.equal(functionNames.includes('WETH'), true)
    assert.equal(functionNames.includes('getAmountsOut'), true)
    assert.equal(functionNames.includes('getAmountsIn'), true)
    assert.equal(functionNames.includes('swapExactTokensForTokens'), true)

    assert.match(source, /vendor\/uniswapV2Router\/abi\.json/)
    assert.match(source, /readDappContract/)
    assert.match(source, /readUniswapV2RouterWeth/)
    assert.match(source, /readUniswapV2RouterAmountsOut/)
    assert.match(source, /readUniswapV2RouterAmountsIn/)
    assert.match(entry, /UNISWAP_V2_ROUTER_ABI/)

    assert.match(contractsReadme, /project-specific contract wrappers/i)
    assert.match(contractsReadme, /ERC20/)
    assert.match(contractsReadme, /Router/)
})
