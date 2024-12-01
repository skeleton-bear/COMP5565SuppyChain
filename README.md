# Diamond NFT DApp

A blockchain-based diamond NFT tracking system built on Ethereum, designed to record the complete lifecycle of diamonds from mining to end users.

## Prerequisites

- Node.js (v14.0.0 or higher)
- MetaMask browser extension

## Installation

1. Clone the repository

```
git clone [your-github-repo-url]
cd diamond-nft-dapp
```

2. Install dependencies
```
npm install
```

3. Install Hardhat (if not already installed)
```
npm install --save-dev hardhat
```

## Running the Project

1. Start local blockchain network
```
npx hardhat node
```

2. Deploy smart contracts (in a new terminal)
```
npx hardhat run scripts/deploy.js --network localhost
```

3. Copy the deployed contract address from the console output and update `CONTRACT_ADDRESS` in `src/config.js`
```
// src/config.js
export const CONTRACT_ADDRESS = "your-deployed-contract-address";
```

4. Start the frontend application
```
npm run serve
```

5. Configure MetaMask
- Open MetaMask
- Add a new network with the following settings:
  - Network Name: Hardhat
  - RPC URL: http://127.0.0.1:8545/
  - Chain ID: 31337
  - Currency Symbol: ETH

6. Import test account
- Copy any private key from the Hardhat node output
- Click "Import Account" in MetaMask
- Paste the private key to import the account

7. Access the application
- Open your browser and visit `http://localhost:8080`
- Connect your wallet using MetaMask
- Start using the application

## Project Structure
```
diamond-nft-dapp/
├── contracts/          # Smart contract source files
│   └── DiamondDapp.sol # Main contract
├── scripts/           # Deployment and test scripts
│   ├── deploy.js      # Contract deployment script
│   └── interact.js    # Contract interaction script
├── src/              # Frontend source code
│   ├── Search/       # Search components
│   ├── config.js     # Configuration file
│   └── router/       # Vue router configuration
├── test/            # Test files
└── hardhat.config.js # Hardhat configuration
```

## Features

- Diamond NFT minting
- Complete lifecycle tracking through stages:
  - Mining
  - Cutting
  - Grading
  - Jewelry Making
  - Design
  - Customer Ownership
- Ownership transfer management
- Detailed diamond information tracking

## Important Notes

- After restarting the Hardhat network:
  - Redeploy the contract
  - Update the contract address in `src/config.js`
  - Reset your MetaMask account
- Ensure MetaMask is connected to the local network
- Make sure your account has sufficient test ETH

## Troubleshooting

1. Transaction Nonce Error:
   - Reset your account in MetaMask (Settings > Advanced > Reset Account)

2. Contract Interaction Failures:
   - Verify the contract address is correctly configured
   - Confirm MetaMask is connected to the correct network
   - Check if your account has enough test ETH

3. Page Loading Issues:
   - Check terminal for error messages
   - Verify all services are running (Hardhat node and frontend server)

## Technology Stack

- Frontend: Vue.js
- Smart Contracts: Solidity
- Development Environment: Hardhat
- Blockchain Wallet: MetaMask
- Web3 Library: ethers.js

## Development Commands
```
# Run tests
npx hardhat test

# Compile contracts
npx hardhat compile

# Start development server
npm run serve

# Build for production
npm run build
```

## License

This project is licensed under the MIT License.
