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
  },
};
