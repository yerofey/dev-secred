require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.19',
  networks: {
    sepolia: {
      url: 'https://sepolia.infura.io/v3/fbd4b0104dfb473c979c8d0233a915c2',
      accounts: [
        '0x7b0d68214b969ebc0a028dc53e2f4f98a62696a8d214657cef8781d1ba49169f',
      ],
    },
    'optimism_sepolia': {
      url: 'https://optimism-sepolia.infura.io/v3/fbd4b0104dfb473c979c8d0233a915c2',
      accounts: [
        'ee677f4126ba47f75e5dcd987cc13002ab9cf1216bb387331824b92dc208da83',
      ],
    },
  },
};
