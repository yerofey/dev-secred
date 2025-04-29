// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
            title: 'Secred (web3)',
        },
    },
    ssr: true,
    runtimeConfig: {
        public: {
            scanApiUrl: process.env.SCAN_API_URL,
            scanChainId: process.env.SCAN_CHAIN_ID,
            explorerUrl: process.env.EXPLORER_URL,
            rpcUrl: process.env.RPC_URL,
            chainId: process.env.CHAIN_ID,
            chainName: process.env.CHAIN_NAME,
            chainIcon: process.env.CHAIN_ICON,
            contractAddress: process.env.CONTRACT_ADDRESS,
            startBlock: process.env.START_BLOCK,
            additionFee: process.env.ADDITION_FEE_ETH,
        },
        scanApiKey: process.env.SCAN_API_KEY,
    },
    modules: ['@nuxt/ui', '@nuxtjs/color-mode'],
    ui: {
        global: true,
        icons: 'all',
    },
    colorMode: {
        preference: 'dark',
    },
    compatibilityDate: '2025-04-29',
    // devtools: { enabled: true },
})
