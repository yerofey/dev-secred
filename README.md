# dev-secred

> Secret Notes Service

A decentralized application for storing encrypted notes on the Base blockchain network. This project combines a Nuxt.js frontend with a Solidity smart contract backend to provide a secure and private way to store encrypted notes.

## Features

- **On-chain Note Storage**: Store encrypted notes directly on the Base blockchain
- **Privacy**: All notes are encrypted before being stored on-chain
- **Decentralized**: No central authority controlling your data

## Project Structure

The project consists of two main parts:

1. **Smart Contract (hardhat-project/)**
   - Written in Solidity
   - Deployed on Base network
   - Handles note storage, sharing, and monetization
   - Key features:
     - Note creation with encryption
     - Access fee management
     - Earnings withdrawal

2. **Frontend (nuxt-app/)**
   - Built with Nuxt.js
   - Modern, responsive UI
   - Web3 integration
   - Features:
     - Note creation and management
     - Access fee setting

## Technical Stack

- **Frontend**:
  - Nuxt.js
  - TypeScript
  - Web3.js/Ethers.js
  - Tailwind CSS (based on project structure)

- **Backend**:
  - Solidity
  - Hardhat
  - Base Network

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm/yarn/pnpm/bun
- MetaMask or similar Web3 wallet
- Base network configured in your wallet

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd dev-secred
```

2. Install dependencies for both projects:
```bash
# Install smart contract dependencies
cd hardhat-project
npm install

# Install frontend dependencies
cd ../nuxt-app
npm install
```

3. Configure environment variables:
   - Create `.env` files in both projects
   - Add necessary API keys and network configurations

4. Deploy the smart contract:
```bash
cd hardhat-project
npx hardhat run scripts/deploy.js --network base
```

5. Start the frontend development server:
```bash
cd nuxt-app
npm run dev
```

## Usage

1. Connect your Web3 wallet
2. Create a new note (requires paying a small fee)
3. Encrypt and store your note
4. Generate shareable links if needed
5. Set access fees for your notes
6. Track and withdraw earnings

## Security

- All notes are encrypted before being stored on-chain
- Share links have expiration times
- Access control through smart contract permissions
- Earnings are secured by smart contract logic

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
