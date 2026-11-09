import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import test from 'node:test'

import { useDappStore } from '../src/stores/dapp/store.ts'

const discoModule = new URL('../src/services/contracts/disco.ts', import.meta.url)
const workflowModule = new URL('../src/services/dapp/contractWorkflow.ts', import.meta.url)
const mockModule = 'data:text/javascript,' + encodeURIComponent(`
    export { runDappContractWorkflow } from ${JSON.stringify(workflowModule.href)}
    export const owner = '0x0000000000000000000000000000000000000001'
    export const deployment = {
        chainId: 56,
        project: '0x0000000000000000000000000000000000000002',
        usdt: '0x0000000000000000000000000000000000000003',
        disco: '0x0000000000000000000000000000000000000004',
    }
    export const mocks = {}
    export const DAPP_CURRENT_CHAIN = { id: deployment.chainId }
    export const getDiscoDeployment = () => deployment
    export const getAuthSessionVersion = () => 0
    export const getWalletAddress = () => owner
    export const getConnectedDappAddress = async () => owner
    export const getDappChainId = async () => deployment.chainId
    export const ensureDappChain = async () => {}
    export const translate = (text) => text
    export const checkDappGasBalance = async () => {}
    export const readDappContract = async ({ functionName }) => deployment[functionName] ?? false
    export const readErc20Decimals = async () => 6
    export const checkErc20Balance = (...args) => mocks.checkBalance(...args)
    export const ensureErc20Allowance = (...args) => mocks.ensureAllowance(...args)
    export const createReserve = () => mocks.prepare('reserve')
    export const prepareCardPurchase = () => mocks.prepare('purchase')
    export const prepareReserveSale = () => mocks.prepare('sale')
    export const writeDappContractWithGas = (...args) => mocks.write(...args)
    export const waitForDappContractDataSync = () => mocks.sync()
`)
const mockedImports = new Set([
    '@/i18n/index.ts',
    '@/features/auth/lifecycle.ts',
    '@/features/activation-card/api.ts',
    '@/features/reservation/api.ts',
    '../dapp/index.ts',
    '../storage/common.ts',
    './config.ts',
])
const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === discoModule.href) {
            if (mockedImports.has(specifier)) return nextResolve(mockModule, context)
            if (specifier.startsWith('@/')) return nextResolve(new URL('../src/' + specifier.slice(2), import.meta.url).href, context)
        }
        return nextResolve(specifier, context)
    },
})
const { reserveWithWallet, buyActivationCardsWithWallet, sellReserveWithWallet } = await import(discoModule.href)
const { mocks, owner, deployment } = await import(mockModule)
hooks.deregister()

const loading = () => useDappStore.getState().dappLoading
const scenarios = [
    { api: 'reserve', submit: (signal) => reserveWithWallet(1, '2.5', signal), method: 'joinQueue' },
    { api: 'purchase', submit: (signal) => buyActivationCardsWithWallet(1, 2, '2.5', signal), method: 'buyCard' },
    { api: 'sale', submit: (signal) => sellReserveWithWallet(1, signal), method: 'sellDisco' },
]

for (const { api, submit, method } of scenarios) {
    test(`${api} locks before balance and shows loading before the only signing request`, async () => {
        const balance = Promise.withResolvers()
        const balanceStarted = Promise.withResolvers()
        const signing = Promise.withResolvers()
        const signingStarted = Promise.withResolvers()
        const sync = Promise.withResolvers()
        const syncStarted = Promise.withResolvers()
        const token = api === 'sale' ? deployment.disco : deployment.usdt
        const signedAmount = api === 'sale' ? 7_000_000n : 2_500_000n
        const checks = [], allowances = [], requests = [], writes = []
        mocks.checkBalance = (...args) => {
            checks.push(args)
            if (checks.length === 1) {
                balanceStarted.resolve()
                return balance.promise
            }
        }
        mocks.ensureAllowance = (...args) => allowances.push([loading(), ...args])
        mocks.prepare = (endpoint) => {
            requests.push([endpoint, loading()])
            signingStarted.resolve()
            return signing.promise
        }
        mocks.write = ({ functionName }) => writes.push([functionName, loading()])
        mocks.sync = () => {
            syncStarted.resolve()
            return sync.promise
        }

        const signal = new AbortController().signal
        const pending = submit(signal)
        await balanceStarted.promise
        assert.equal(loading(), false)
        assert.deepEqual(requests, [])
        await assert.rejects(submit(signal), /交易处理中/)

        balance.resolve()
        await signingStarted.promise
        assert.deepEqual(requests, [[api, true]])
        assert.equal(allowances.length, api === 'sale' ? 0 : 1)
        await assert.rejects(submit(signal), /交易处理中/)

        signing.resolve({
            id: 1,
            deadline: Math.floor(Date.now() / 1000) + 90,
            sign: '0x' + 'ab'.repeat(65),
            ...(api === 'sale'
                ? { token_amount: String(signedAmount), usdt_amount: '5000000', leader_address: owner, leader_amount: '0' }
                : { amount: String(signedAmount), recipient: owner }),
        })
        await syncStarted.promise
        assert.equal(loading(), true)
        sync.resolve()
        await pending

        assert.deepEqual(checks, [[api === 'sale' ? 1n : signedAmount, token, owner], [signedAmount, token, owner]])
        assert.equal(allowances.length, api === 'sale' ? 1 : 2)
        assert.ok(allowances.every(([visible, spender, amount]) => visible && spender === deployment.project && amount === signedAmount))
        assert.deepEqual(writes, [[method, true]])
        assert.deepEqual(requests, [[api, true]])
        assert.equal(loading(), false)
    })
}

test('a failed balance precheck leaves the overlay closed and releases the submit lock', async () => {
    let checks = 0
    mocks.checkBalance = async () => {
        checks++
        throw new Error('Balance too low')
    }
    mocks.prepare = () => assert.fail('An insufficient balance must not request a signature')
    const signal = new AbortController().signal
    await assert.rejects(sellReserveWithWallet(1, signal), /Balance too low/)
    await assert.rejects(sellReserveWithWallet(1, signal), /Balance too low/)
    assert.equal(checks, 2)
    assert.equal(loading(), false)
})
