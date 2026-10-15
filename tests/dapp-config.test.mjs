import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { DAPP_CONFIG, DAPP_PRODUCTION_CHAIN, DAPP_CURRENT_CHAIN } from '../src/services/dapp/config.ts'
import { waitForDappContractDataSync } from '../src/services/dapp/contractRefresh.ts'

test('dapp production chain and transaction policies are project settings', () => {
    const source = readFileSync('src/services/dapp/config.ts', 'utf8')
    const readme = readFileSync('src/services/dapp/README.md', 'utf8')

    assert.equal(Number.isSafeInteger(DAPP_PRODUCTION_CHAIN.id), true)
    assert.equal(DAPP_PRODUCTION_CHAIN.id > 0, true)
    assert.ok(DAPP_CURRENT_CHAIN)
    assert.match(source, /DAPP_LOCAL_CHAIN = defineChain/)
    assert.doesNotMatch(source, /VITE_CHAIN_/)
    assert.match(source, /VITE_RPC_URL/)
    assert.match(source, /DAPP_CONFIG/)
    assert.equal(typeof DAPP_CONFIG.minGasBalance, 'string')
    assert.equal(typeof DAPP_CONFIG.enableGasCheck, 'boolean')
    assert.equal(typeof DAPP_CONFIG.enableGasEstimate, 'boolean')
    assert.equal(typeof DAPP_CONFIG.enableErc20MaxApprove, 'boolean')
    assert.equal(typeof DAPP_CONFIG.contractWriteRefreshDelayMs, 'number')
    assert.equal(Number.isInteger(DAPP_CONFIG.amountDecimals), true)
    assert.ok(DAPP_CONFIG.amountDecimals >= 0 && DAPP_CONFIG.amountDecimals <= 36)
    assert.equal(Number.isFinite(DAPP_CONFIG.contractWriteRefreshDelayMs), true)
    assert.equal(DAPP_CONFIG.contractWriteRefreshDelayMs >= 0, true)
    assert.doesNotMatch(source, /VITE_DAPP_AMOUNT_DECIMALS/)
    assert.doesNotMatch(source, /VITE_MIN_GAS_BALANCE/)
    assert.doesNotMatch(source, /VITE_ENABLE_DAPP_GAS_CHECK/)
    assert.doesNotMatch(source, /VITE_ENABLE_DAPP_GAS_ESTIMATE/)
    assert.doesNotMatch(source, /VITE_ENABLE_ERC20_MAX_APPROVE/)
    assert.match(readme, /DAPP_PRODUCTION_CHAIN/)
    assert.match(readme, /DAPP_CONFIG/)
    assert.doesNotMatch(readme, /env chain config/)
})

test('dapp reusable constants live in the module config file', () => {
    const configSource = readFileSync('src/services/dapp/config.ts', 'utf8')
    const unitsSource = readFileSync('src/services/dapp/units.ts', 'utf8')

    assert.match(configSource, /DAPP_MAX_AMOUNT_DECIMALS/)
    assert.match(configSource, /DAPP_DEFAULT_AMOUNT_DECIMALS/)
    assert.match(configSource, /DAPP_ERC20_MAX_APPROVE_AMOUNT/)
    assert.doesNotMatch(unitsSource, /const MAX_DAPP_AMOUNT_DECIMALS/)
})

test('contract write refresh wait is controlled by the dapp config', () => {
    const refreshSource = readFileSync('src/services/dapp/contractRefresh.ts', 'utf8')
    const readme = readFileSync('src/services/dapp/README.md', 'utf8')

    assert.equal(typeof waitForDappContractDataSync, 'function')
    assert.match(refreshSource, /DAPP_CONFIG\.contractWriteRefreshDelayMs/)
    assert.match(refreshSource, /setTimeout/)
    assert.match(readme, /waitForDappContractDataSync/)
    assert.match(readme, /contractWriteRefreshDelayMs/)
})
