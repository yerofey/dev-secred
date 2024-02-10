// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    runtimeConfig: {
        public: {
            etherscanApiUrl: process.env.NUXT_PUBLIC_ETHERSCAN_API_URL,
            explorerUrl: process.env.NUXT_PUBLIC_EXPLORER_URL,
            rpcUrl: process.env.NUXT_PUBLIC_RPC_URL,
            chainId: process.env.NUXT_PUBLIC_CHAIN_ID,
            chainName: process.env.NUXT_PUBLIC_CHAIN_NAME,
            contractAddress: process.env.NUXT_PUBLIC_CONTRACT_ADDRESS,
            startBlock: process.env.NUXT_PUBLIC_START_BLOCK,
            additionFee: process.env.NUXT_PUBLIC_ADDITION_FEE_ETH,
            etherscanApiKey: process.env.NUXT_PUBLIC_ETHERSCAN_API_KEY,
        },
        etherscanApiKey: process.env.NUXT_ETHERSCAN_API_KEY,
    },
    modules: ['@nuxt/ui', '@nuxtjs/color-mode'],
    ui: {
        global: true,
        icons: 'all',
    }
})
