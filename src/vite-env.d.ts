/// <reference types="vite/client" />

interface ViteTypeOptions {
    strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
    readonly VITE_BASE_URL: string
    readonly VITE_RPC_URL: string
    readonly VITE_USDT: string
    readonly VITE_DISCO_PROJECT: string
    readonly VITE_DISCO: string
    readonly VITE_CONTRACT_CHAIN_ID: string
    readonly VITE_APP_NAME: string
    readonly VITE_STATIC_PAGE_MODE: string
    readonly VITE_ENABLE_SOCIAL_META: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
