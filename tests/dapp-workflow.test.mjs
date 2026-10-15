import test from 'node:test'
import assert from 'node:assert/strict'

import { useDappStore } from '../src/stores/dapp/store.ts'
import { beginDappContractWorkflow, runDappContractWorkflow } from '../src/services/dapp/contractWorkflow.ts'
import { estimateDappContractGas, writeDappContract } from '../src/services/dapp/contract.ts'
import { resetDappProviderCache } from '../src/services/dapp/provider.ts'
import { DAPP_CONFIG, DAPP_CURRENT_CHAIN } from '../src/services/dapp/config.ts'
import { logDappContractDiagnostic } from '../src/services/dapp/contractDebug.ts'

const address = '0x0000000000000000000000000000000000000001'
const abi = [{ type: 'function', name: 'deposit', stateMutability: 'payable', inputs: [], outputs: [] }]

test('nested and concurrent workflows stay pending until every owner releases', async () => {
    useDappStore.getState().resetDappState()
    const first = beginDappContractWorkflow()
    const second = beginDappContractWorkflow()
    assert.equal(useDappStore.getState().pendingContractWorkflows, 2)
    first()
    first()
    useDappStore.getState().setDappLoading(false)
    assert.equal(useDappStore.getState().dappLoading, true)
    const phases = []
    await runDappContractWorkflow(async () => {
        phases.push(useDappStore.getState().dappLoading)
        await runDappContractWorkflow(async () => {
            phases.push(useDappStore.getState().dappLoading)
        })
        phases.push(useDappStore.getState().dappLoading)
    })
    assert.deepEqual(phases, [true, true, true])
    assert.equal(useDappStore.getState().dappLoading, true)
    second()
    assert.equal(useDappStore.getState().dappLoading, false)
    assert.equal(useDappStore.getState().pendingContractWorkflows, 0)
    await assert.rejects(runDappContractWorkflow(async () => { throw new Error('rejected') }))
    assert.equal(useDappStore.getState().dappLoading, false)
})

test('payable gas estimation forwards the same native value to eth_estimateGas', async () => {
    resetDappProviderCache()
    const calls = []
    globalThis.window = { ethereum: { request: async (call) => {
        calls.push(call)
        if (call.method === 'eth_accounts') return [address]
        if (call.method === 'eth_estimateGas') return '0x5208'
        throw new Error(call.method)
    } } }
    const gas = await estimateDappContractGas({ address, abi, functionName: 'deposit', value: 123n })
    assert.equal(gas, 21000n)
    assert.equal(calls.find((call) => call.method === 'eth_estimateGas').params[0].value, '0x7b')
})

test('write pending starts before gas and wallet preparation and clears after rejection', async () => {
    const previous = DAPP_CONFIG.enableGasCheck
    DAPP_CONFIG.enableGasCheck = true
    resetDappProviderCache()
    let releaseAddress
    const accounts = new Promise((resolve) => { releaseAddress = resolve })
    globalThis.window = { ethereum: { request: async (call) => {
        if (call.method === 'eth_accounts') return accounts
        if (call.method === 'eth_getBalance') return '0x0'
        if (call.method === 'eth_chainId') return `0x${DAPP_CURRENT_CHAIN.id.toString(16)}`
        throw new Error(call.method)
    } } }
    try {
        const pending = writeDappContract({ address, abi, functionName: 'deposit' })
        assert.equal(useDappStore.getState().dappLoading, true)
        releaseAddress([address])
        await assert.rejects(pending)
        assert.equal(useDappStore.getState().dappLoading, false)
    } finally {
        DAPP_CONFIG.enableGasCheck = previous
    }
})

test('contract diagnostics are gated and format bigint without project identifiers', () => {
    const original = console.debug
    const logs = []
    console.debug = (...args) => logs.push(args)
    try {
        logDappContractDiagnostic('read', { result: 42n }, false)
        assert.equal(logs.length, 0)
        logDappContractDiagnostic('read', { result: 42n }, true)
        assert.equal(logs[0][0], '[contract:read]')
        assert.deepEqual(JSON.parse(logs[0][1]), { result: '42' })
        const circular = { result: 7n }
        circular.self = circular
        assert.doesNotThrow(() => logDappContractDiagnostic('read', circular, true))
        assert.equal(JSON.parse(logs[1][1]).self, '[Circular]')
        console.debug = () => { throw new Error('console unavailable') }
        assert.doesNotThrow(() => logDappContractDiagnostic('read', { result: 1n }, true))
    } finally {
        console.debug = original
    }
})
