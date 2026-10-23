import { isAddress, zeroAddress, type Address } from 'viem'
import { translate } from '@/i18n/index.ts'
import { DAPP_CURRENT_CHAIN } from '../dapp/config.ts'

function address(value: string | undefined): Address {
    if (!value || !isAddress(value) || value.toLowerCase() === zeroAddress) {
        throw new Error(translate('合约地址未配置，请联系管理员'))
    }
    return value as Address
}

export function getDiscoDeployment() {
    const chainId = Number(import.meta.env.VITE_CONTRACT_CHAIN_ID)
    if (!chainId || chainId !== DAPP_CURRENT_CHAIN.id) {
        throw new Error(translate('合约部署网络与当前配置不一致'))
    }
    return {
        chainId,
        project: address(import.meta.env.VITE_DISCO_PROJECT),
        usdt: address(import.meta.env.VITE_USDT),
        disco: address(import.meta.env.VITE_DISCO),
    }
}
