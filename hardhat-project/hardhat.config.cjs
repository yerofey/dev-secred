require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.19',
  networks: {
    arbitrum_sepolia: {
      url: 'https://arbitrum-sepolia.infura.io/v3/fbd4b0104dfb473c979c8d0233a915c2',
      accounts: [
        'ee677f4126ba47f75e5dcd987cc13002ab9cf1216bb387331824b92dc208da83',
      ],
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/fbd4b0104dfb473c979c8d0233a915c2',
      accounts: [
        'ee677f4126ba47f75e5dcd987cc13002ab9cf1216bb387331824b92dc208da83',
      ],
    },
    optimism_sepolia: {
      url: 'https://optimism-sepolia.infura.io/v3/fbd4b0104dfb473c979c8d0233a915c2',
      accounts: [
        'ee677f4126ba47f75e5dcd987cc13002ab9cf1216bb387331824b92dc208da83',
      ],
    },
    base_mainnet: {
      url: 'https://shy-red-dinghy.base-mainnet.quiknode.pro/e60e1277d62a9730a3731f29e69274871b424f9b/',
      accounts: [
        'ee677f4126ba47f75e5dcd987cc13002ab9cf1216bb387331824b92dc208da83',
      ],
    },
    // base_sepolia: {
    //   url: 'https://proportionate-long-borough.base-sepolia.quiknode.pro/2f7250c6c4daf02de4b40f8b88b073af7f54ebc7/',
    //   accounts: [
    //     'ee677f4126ba47f75e5dcd987cc13002ab9cf1216bb387331824b92dc208da83',
    //   ],
    // },
  },
};
