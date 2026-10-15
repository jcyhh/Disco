import { create } from 'zustand'

import { DAPP_PROVIDER_STATUS } from '../../services/dapp/config.ts'
import {
    getWalletAddress,
    removeWalletAddress,
    setWalletAddress,
} from '../../services/storage/common.ts'
import type { DappStoreState } from './types.ts'

const pendingWorkflows = new Set<symbol>()
let manualLoading = false

export const useDappStore = create<DappStoreState>()((set) => ({
    providerStatus: DAPP_PROVIDER_STATUS.checking,
    walletAddress: getWalletAddress(),
    chainId: undefined,
    dappLoading: false,
    pendingContractWorkflows: 0,
    beginContractWorkflow: () => {
        const workflow = Symbol('contract-workflow')
        pendingWorkflows.add(workflow)
        set({ dappLoading: true, pendingContractWorkflows: pendingWorkflows.size })

        return () => {
            if (!pendingWorkflows.delete(workflow)) return
            set({
                dappLoading: manualLoading || pendingWorkflows.size > 0,
                pendingContractWorkflows: pendingWorkflows.size,
            })
        }
    },
    setProviderStatus: (providerStatus) => set({ providerStatus }),
    setWalletAddress: (walletAddress) => {
        setWalletAddress(walletAddress)
        set({ walletAddress })
    },
    clearWalletAddress: () => {
        removeWalletAddress()
        set({ walletAddress: '' })
    },
    setChainId: (chainId) => set({ chainId }),
    setDappLoading: (dappLoading) => {
        manualLoading = dappLoading
        set({ dappLoading: manualLoading || pendingWorkflows.size > 0 })
    },
    resetDappState: () => {
        manualLoading = false
        removeWalletAddress()
        set({
            providerStatus: DAPP_PROVIDER_STATUS.checking,
            walletAddress: '',
            chainId: undefined,
            dappLoading: pendingWorkflows.size > 0,
        })
    },
}))
