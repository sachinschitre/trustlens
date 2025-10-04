# TrustLens NFT Receipt - Solana Anchor Program

A Solana Anchor smart contract that mints NFTs for each escrow deal created on Aeternity blockchain. These NFTs serve as cross-chain receipts and are soulbound (non-transferable) until the escrow is completed.

## 🚀 Features

### Core Functionality
- **NFT Minting**: Mint unique NFTs for each Aeternity escrow deal
- **Soulbound NFTs**: Non-transferable until escrow completion
- **Oracle Authorization**: Only authorized oracle can mint/update NFTs
- **Rich Metadata**: Includes escrow details, AI verification scores, and status
- **Cross-Chain Integration**: Bridges Aeternity escrows to Solana NFTs

### NFT Metadata Includes
- `escrow_id`: Unique identifier from Aeternity
- `client_wallet`: Client's Solana wallet address
- `freelancer_wallet`: Freelancer's Solana wallet address
- `amount`: Escrow amount in lamports
- `status`: Current escrow status (Active/Released/Disputed)
- `completion_score`: AI verification score (0-100)
- `timestamp`: Creation timestamp
- `project_description`: Project description

### Smart Contract Functions
- `initialize()`: Initialize the program with oracle authority
- `mint_escrow_nft()`: Mint NFT for new escrow deal
- `update_escrow_status()`: Update escrow status and completion score
- `transfer_nft()`: Transfer NFT after escrow completion
- `get_escrow_data()`: Retrieve escrow data from NFT

## 📋 Prerequisites

### Required Software
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor Framework
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install Node.js dependencies
npm install
```

### Environment Setup
```bash
# Configure Solana CLI
solana config set --url localhost  # for local development
solana config set --url devnet    # for devnet testing
solana config set --url mainnet   # for production

# Create keypair if needed
solana-keygen new --outfile ~/.config/solana/id.json
```

## 🔧 Installation & Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd solana-nft-receipt
npm install
```

### 2. Build the Program
```bash
# Build the Anchor program
anchor build

# Generate TypeScript types
anchor build --idl target/idl/trustlens_nft_receipt.json
```

### 3. Deploy to Localnet
```bash
# Start local Solana validator
solana-test-validator

# Deploy the program
anchor deploy

# Initialize the program
npm run deploy
```

### 4. Deploy to Devnet
```bash
# Set cluster to devnet
export CLUSTER=devnet

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Initialize with devnet
npm run deploy
```

## 🎯 Usage Examples

### Basic Client Usage

```typescript
import { TrustlensNftClient } from "./ts/client/trustlens-client";
import { PublicKey, Keypair } from "@solana/web3.js";

// Initialize client
const program = anchor.workspace.TrustlensNftReceipt;
const client = new TrustlensNftClient(program);

// Create oracle from seed
const oracle = TrustlensNftClient.createOracleFromSeed("your-oracle-seed");

// Mint NFT for new escrow
await client.mintEscrowNft(
  oracle,
  oracle,
  "ae_escrow_123456789",  // Aeternity escrow ID
  clientWallet,
  freelancerWallet,
  5000000000,  // 5 SOL in lamports
  "Build a DeFi dashboard with real-time price feeds"
);

// Update status after AI verification
await client.updateEscrowStatus(
  oracle,
  "ae_escrow_123456789",
  { released: {} },  // or { disputed: {} }
  85  // completion score
);

// Transfer NFT after completion
await client.transferNft(
  clientWallet,
  recipientWallet,
  "ae_escrow_123456789"
);
```

### AI Service Integration

```typescript
import { TrustlensAiIntegration } from "./ts/client/trustlens-client";

const aiIntegration = new TrustlensAiIntegration(client, oracle);

// When new escrow is created on Aeternity
await aiIntegration.createEscrowNft(
  aeternityEscrowId,
  clientSolanaWallet,
  freelancerSolanaWallet,
  amount,
  projectDescription
);

// When AI verification completes
await aiIntegration.updateAfterAiVerification(
  escrowId,
  completionScore,
  recommendation
);

// When escrow is released/disputed on Aeternity
await aiIntegration.markEscrowReleased(escrowId);
// or
await aiIntegration.markEscrowDisputed(escrowId);
```

### Integration with TrustLens AI Service

```javascript
// In your AI verification service
const { TrustlensNftClient } = require('./solana-nft-receipt/ts/client/trustlens-client');

async function updateEscrowAfterAiVerification(escrowId, aiResult) {
  const oracle = TrustlensNftClient.createOracleFromSeed(process.env.ORACLE_SEED);
  
  await client.updateEscrowStatus(
    oracle,
    escrowId,
    aiResult.recommendation === 'release' ? { released: {} } : { disputed: {} },
    aiResult.completionScore
  );
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
anchor test

# Run specific test file
npm run test

# Test with specific cluster
CLUSTER=devnet npm run test
```

### Test Scenarios
1. **Program Initialization**: Verify oracle setup
2. **NFT Minting**: Create NFT for escrow deal
3. **Status Updates**: Update escrow status and scores
4. **Soulbound Behavior**: Verify non-transferability until completion
5. **Authorization**: Test oracle-only access
6. **Transfer**: Transfer after escrow completion

## 🔐 Security Considerations

### Oracle Security
- **Deterministic Keypairs**: Use seed-based oracle keypairs for consistency
- **Private Key Management**: Store oracle private keys securely
- **Access Control**: Only authorized services should have oracle access
- **Signature Verification**: Verify oracle signatures in off-chain integrations

### Smart Contract Security
- **Input Validation**: All inputs are validated before processing
- **Authorization Checks**: Oracle authorization is verified for all state changes
- **Soulbound Logic**: NFTs remain non-transferable until escrow completion
- **Error Handling**: Comprehensive error codes for different failure scenarios

## 📊 Program Architecture

### Account Structure
```
Master Account (PDA)
├── authority: Pubkey (oracle)
├── bump: u8
└── total_minted: u64

Escrow NFT Account (PDA)
├── escrow_data: EscrowData
├── is_soulbound: bool
└── bump: u8
```

### Escrow Data Structure
```rust
struct EscrowData {
    escrow_id: String,           // Aeternity escrow ID
    client_wallet: Pubkey,      // Client's Solana wallet
    freelancer_wallet: Pubkey,  // Freelancer's Solana wallet
    amount: u64,                // Amount in lamports
    status: EscrowStatus,       // Active/Released/Disputed
    completion_score: Option<u8>, // AI verification score
    timestamp: i64,             // Creation timestamp
    project_description: String, // Project description
}
```

## 🚀 Deployment Guide

### Local Development
```bash
# 1. Start local validator
solana-test-validator

# 2. Build and deploy
anchor build
anchor deploy

# 3. Initialize program
npm run deploy
```

### Devnet Deployment
```bash
# 1. Set environment
export CLUSTER=devnet
export ORACLE_SEED=trustlens-oracle-devnet

# 2. Deploy
anchor deploy --provider.cluster devnet

# 3. Initialize
npm run deploy
```

### Mainnet Deployment
```bash
# 1. Set environment
export CLUSTER=mainnet
export ORACLE_SEED=trustlens-oracle-production

# 2. Deploy
anchor deploy --provider.cluster mainnet-beta

# 3. Initialize
npm run deploy
```

## 🔗 Integration with TrustLens Ecosystem

### Aeternity Integration
1. **Escrow Creation**: Monitor Aeternity for new escrow contracts
2. **NFT Minting**: Mint corresponding NFT on Solana
3. **Status Sync**: Update NFT status when Aeternity escrow changes
4. **Completion**: Make NFT transferable when escrow completes

### AI Service Integration
1. **Verification Results**: Update NFT with AI completion scores
2. **Recommendations**: Set NFT status based on AI recommendations
3. **Oracle Signatures**: Verify AI service authenticity
4. **Real-time Updates**: Sync AI results to Solana NFTs

### Frontend Integration
1. **NFT Display**: Show escrow NFTs in TrustLens frontend
2. **Status Tracking**: Display real-time escrow status
3. **Transfer Interface**: Allow NFT transfers after completion
4. **Metadata Viewing**: Show rich escrow metadata

## 📈 Future Enhancements

### Planned Features
- **Collection Support**: Group NFTs by project type
- **Royalty System**: Implement creator royalties
- **Metadata Updates**: Dynamic metadata based on escrow progress
- **Multi-chain Support**: Support for other blockchains
- **Governance**: Community governance for oracle management

### Advanced Features
- **Batch Operations**: Mint multiple NFTs efficiently
- **Upgradeable Program**: Support for program upgrades
- **Cross-chain Verification**: Verify Aeternity state on Solana
- **Analytics**: Track escrow patterns and success rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Join our community discussions
- **Discord**: Join our Discord for real-time support

---

Built with ❤️ for the TrustLens ecosystem - bridging Aeternity escrows with Solana NFTs! 🚀
