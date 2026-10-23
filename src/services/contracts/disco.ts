import { isAddress, isHex, parseUnits, zeroAddress, type Hex, type Address } from 'viem'
import { translate } from '@/i18n/index.ts'
import { getAuthSessionVersion } from '@/features/auth/lifecycle.ts'
import { prepareCardPurchase } from '@/features/activation-card/api.ts'
import { createReserve, prepareReserveSale } from '@/features/reservation/api.ts'
import type { ReservePayment, ReserveSale } from '@/features/reservation/types.ts'
import {
    checkDappGasBalance, checkErc20Balance, DAPP_CURRENT_CHAIN, ensureDappChain,
    ensureErc20Allowance, getConnectedDappAddress, getDappChainId, readDappContract,
    readErc20Decimals, runDappContractWorkflow, waitForDappContractDataSync,
    writeDappContractWithGas,
} from '../dapp/index.ts'
import { getWalletAddress } from '../storage/common.ts'
import { getDiscoDeployment } from './config.ts'
import { DISCO_PROJECT_ABI } from './discoProjectAbi.ts'

type Action = 'joinQueue' | 'buyCard' | 'sellDisco'
type SignedOrder = ReservePayment | ReserveSale
type ValidatedOrder = (ReservePayment & { recipient: Address; sign: Hex }) | (ReserveSale & { leader_address: Address; sign: Hex })
const preparedOrders = new Map<string, SignedOrder>()
let pending = false

function fail(text: string): never { throw new Error(translate(text)) }

function uint(value: string | number): bigint {
    const text = String(value)
    if (!/^\d+$/.test(text) || (typeof value === 'number' && !Number.isSafeInteger(value))) fail('签名参数无效，请刷新后重试')
    const result = BigInt(text)
    if (result >= 2n ** 256n) fail('签名参数无效，请刷新后重试')
    return result
}

function validateOrder(order: SignedOrder): asserts order is ValidatedOrder {
    if (uint(order.id) === 0n || uint(order.deadline) <= BigInt(Math.floor(Date.now() / 1000))) fail('交易签名已过期，请重试')
    if (!isHex(order.sign) || order.sign.length !== 132) fail('签名参数无效，请刷新后重试')
    if ('amount' in order) {
        if (uint(order.amount) === 0n || !isAddress(order.recipient) || order.recipient.toLowerCase() === zeroAddress) fail('签名参数无效，请刷新后重试')
    } else {
        if (uint(order.token_amount) === 0n || uint(order.usdt_amount) === 0n || !isAddress(order.leader_address)) fail('签名参数无效，请刷新后重试')
        if (uint(order.leader_amount) > 0n && order.leader_address.toLowerCase() === zeroAddress) fail('签名参数无效，请刷新后重试')
    }
}

async function submit(action: Action, key: string, displayAmount: string, prepare: (signal?: AbortSignal) => Promise<SignedOrder>, signal: AbortSignal) {
    if (pending) fail('交易处理中，请稍候')
    pending = true
    try {
        await runDappContractWorkflow(async () => {
            signal.throwIfAborted()
            const deployment = getDiscoDeployment()
            const session = getAuthSessionVersion()
            const owner = getWalletAddress().toLowerCase()
            async function assertCurrent() {
                signal.throwIfAborted()
                if (!owner || session !== getAuthSessionVersion() || getWalletAddress().toLowerCase() !== owner || (await getConnectedDappAddress()).toLowerCase() !== owner) fail('钱包账号已变更，请重新登录')
                if (await getDappChainId() !== deployment.chainId) fail('钱包网络已变更，请重试')
                signal.throwIfAborted()
            }
            await ensureDappChain(DAPP_CURRENT_CHAIN, { skipInDevelopment: false })
            await assertCurrent()
            const cacheKey = `${deployment.chainId}:${deployment.project}:${owner}:${action}:${key}`
            const usedFunction = action === 'joinQueue' ? 'isJoinQueueIdUsed' : action === 'buyCard' ? 'isBuyCardIdUsed' : 'isSellDiscoIdUsed'
            for (const [cachedKey, cached] of preparedOrders) {
                if (cached.deadline <= Math.floor(Date.now() / 1000)) preparedOrders.delete(cachedKey)
            }
            let order = preparedOrders.get(cacheKey)
            async function isUsed(signed: SignedOrder) {
                // IDs are global replay flags, so this read needs no account context.
                return readDappContract({ address: deployment.project, abi: DISCO_PROJECT_ABI, functionName: usedFunction, args: [uint(signed.id)] })
            }
            // A receipt timeout must not make the next retry spend or prepare again.
            if (order && await isUsed(order)) {
                preparedOrders.delete(cacheKey)
                await waitForDappContractDataSync()
                return
            }
            await checkDappGasBalance()
            // Public deployment metadata does not depend on msg.sender.
            const [usdt, disco] = await Promise.all((['usdt', 'disco'] as const).map((functionName) => readDappContract({ address: deployment.project, abi: DISCO_PROJECT_ABI, functionName })))
            if (usdt.toLowerCase() !== deployment.usdt.toLowerCase() || disco.toLowerCase() !== deployment.disco.toLowerCase()) fail('合约代币配置不一致，请联系管理员')
            const token = action === 'sellDisco' ? deployment.disco : deployment.usdt
            let expected: bigint | null = null
            if (action !== 'sellDisco') {
                const decimals = await readErc20Decimals(token)
                if (!/^\d+(?:\.\d+)?$/.test(displayAmount) || (displayAmount.split('.')[1]?.length ?? 0) > decimals) fail('支付数量无效，请刷新后重试')
                expected = parseUnits(displayAmount, decimals)
                if (expected <= 0n) fail('请输入有效金额，最多十八位小数')
                await checkErc20Balance(expected, token, owner as Address)
                await assertCurrent()
                // Reservation and purchase totals are known before requesting a signature.
                await ensureErc20Allowance(deployment.project, expected, token, owner as Address)
            }
            await assertCurrent()
            if (!order) {
                order = await prepare(signal)
                validateOrder(order)
                if (action === 'sellDisco' ? 'amount' in order : !('amount' in order)) fail('签名参数无效，请刷新后重试')
                preparedOrders.set(cacheKey, order)
            }
            await assertCurrent()
            const used = await isUsed(order)
            if (!used) {
                validateOrder(order)
                const signedAmount = uint('amount' in order ? order.amount : order.token_amount)
                if (expected !== null && signedAmount !== expected) fail('支付数量已变更，请刷新后重试')
                await checkErc20Balance(signedAmount, token, owner as Address)
                await assertCurrent()
                await ensureErc20Allowance(deployment.project, signedAmount, token, owner as Address)
                await assertCurrent()
                validateOrder(order)
                const transaction = { address: deployment.project, abi: DISCO_PROJECT_ABI, account: owner as Address }
                if (action === 'sellDisco' && !('amount' in order)) {
                    await writeDappContractWithGas({ ...transaction, functionName: action, args: [uint(order.id), signedAmount, uint(order.usdt_amount), order.leader_address, uint(order.leader_amount), uint(order.deadline), order.sign] })
                } else if (action !== 'sellDisco' && 'amount' in order) {
                    await writeDappContractWithGas({ ...transaction, functionName: action, args: [uint(order.id), signedAmount, order.recipient, uint(order.deadline), order.sign] })
                } else {
                    fail('签名参数无效，请刷新后重试')
                }
            }
            preparedOrders.delete(cacheKey)
            await waitForDappContractDataSync()
        })
    } finally {
        pending = false
    }
}

export function reserveWithWallet(amountId: number, amount: string, signal: AbortSignal) {
    return submit('joinQueue', String(amountId), amount, (requestSignal) => createReserve(amountId, requestSignal), signal)
}

export function buyActivationCardsWithWallet(cardId: number, num: number, total: string, signal: AbortSignal) {
    return submit('buyCard', `${cardId}:${num}`, total, (requestSignal) => prepareCardPurchase({ card_id: cardId, num }, requestSignal), signal)
}

export function sellReserveWithWallet(id: number, signal: AbortSignal) {
    return submit('sellDisco', String(id), '', (requestSignal) => prepareReserveSale(id, requestSignal), signal)
}
