# TrustLens NFT Receipt - Deployment Guide

This guide walks you through deploying the TrustLens NFT Receipt program to different Solana networks and integrating it with the TrustLens ecosystem.

## 📋 Prerequisites

### Required Software
```bash
# Install Solana CLI (v1.17.0 or later)
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
# Configure Solana CLI for your target network
solana config set --url localhost      # Local development
solana config set --url devnet        # Devnet testing
solana config set --url mainnet-beta  # Production

# Create or import your wallet
solana-keygen new --outfile ~/.config/solana/id.json
```

## 🏠 Local Development Deployment

### 1. Start Local Validator
```bash
# Start Solana test validator
solana-test-validator --reset

# In another terminal, verify it's running
solana cluster-version
```

### 2. Deploy Program
```bash
# Build the program
anchor build

# Deploy to localnet
anchor deploy

# Verify deployment
solana program show <PROGRAM_ID>
```

### 3. Initialize Program
```bash
# Set environment variables
export CLUSTER=localnet
export ORACLE_SEED=trustlens-oracle-localnet

# Run deployment script
npm run deploy
```

### 4. Run Tests
```bash
# Run all tests
anchor test

# Run specific test
npm run test
```

## 🌐 Devnet Deployment

### 1. Configure for Devnet
```bash
# Set Solana config to devnet
solana config set --url devnet

# Get some devnet SOL
solana airdrop 2

# Verify balance
solana balance
```

### 2. Deploy Program
```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Note the program ID from deployment
```

### 3. Initialize Program
```bash
# Set environment variables
export CLUSTER=devnet
export ORACLE_SEED=trustlens-oracle-devnet

# Deploy and initialize
npm run deploy
```

### 4. Verify Deployment
```bash
# Check program on devnet
solana program show <PROGRAM_ID> --url devnet

# Test basic functionality
npm run test
```

## 🚀 Production Deployment (Mainnet)

### 1. Pre-deployment Checklist
- [ ] Code reviewed and tested
- [ ] Security audit completed
- [ ] Oracle keypair generated and secured
- [ ] Deployment scripts tested on devnet
- [ ] Backup procedures in place

### 2. Configure for Mainnet
```bash
# Set Solana config to mainnet
solana config set --url mainnet-beta

# Verify you have sufficient SOL for deployment
solana balance
# You need at least 2-3 SOL for program deployment
```

### 3. Deploy Program
```bash
# Build for production
anchor build

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta

# IMPORTANT: Save the program ID and deployment transaction
echo "Program ID: $(solana program show <PROGRAM_ID> --url mainnet-beta)"
```

### 4. Initialize Program
```bash
# Set production environment variables
export CLUSTER=mainnet
export ORACLE_SEED=trustlens-oracle-production

# Initialize program
npm run deploy
```

### 5. Verify Production Deployment
```bash
# Check program on mainnet
solana program show <PROGRAM_ID> --url mainnet-beta

# Verify initialization
solana account <MASTER_PDA> --url mainnet-beta
```

## 🔗 Integration with TrustLens Ecosystem

### 1. AI Service Integration

Update your AI verification service to use the Solana NFT program:

```javascript
// In your AI service
const { TrustlensNftClient } = require('./solana-nft-receipt/ts/client/trustlens-client');

const oracle = TrustlensNftClient.createOracleFromSeed(process.env.ORACLE_SEED);
const client = new TrustlensNftClient(program);

// When AI verification completes
async function updateEscrowAfterAiVerification(escrowId, aiResult) {
  await client.updateEscrowStatus(
    oracle,
    escrowId,
    aiResult.recommendation === 'release' ? { released: {} } : { disputed: {} },
    aiResult.completionScore
  );
}
```

### 2. Frontend Integration

Add NFT display to your React frontend:

```jsx
// In your React components
import { TrustlensNftClient } from './solana-nft-receipt/ts/client/trustlens-client';

function EscrowNFTDisplay({ escrowId }) {
  const [nftData, setNftData] = useState(null);

  useEffect(() => {
    async function fetchNftData() {
      const data = await client.getEscrowData(escrowId);
      setNftData(data);
    }
    fetchNftData();
  }, [escrowId]);

  return (
    <div className="nft-card">
      <h3>Escrow NFT #{escrowId}</h3>
      <p>Status: {nftData?.status}</p>
      <p>Score: {nftData?.completionScore}/100</p>
      <p>Transferable: {!nftData?.isSoulbound ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 3. Aeternity Integration

Set up monitoring for Aeternity escrows:

```javascript
// Monitor Aeternity for new escrows
async function monitorAeternityEscrows() {
  // Watch for new escrow contracts
  // When new escrow is created, mint corresponding NFT
  
  const aeternityEscrow = await getAeternityEscrow(escrowId);
  const clientSolanaWallet = await mapToSolanaAddress(aeternityEscrow.client);
  const freelancerSolanaWallet = await mapToSolanaAddress(aeternityEscrow.freelancer);

  await client.mintEscrowNft(
    oracle,
    oracle,
    escrowId,
    clientSolanaWallet,
    freelancerSolanaWallet,
    aeternityEscrow.amount,
    aeternityEscrow.projectDescription
  );
}
```

## 🔐 Security Considerations

### Oracle Security
1. **Generate Oracle Keypair Securely**
   ```bash
   # Use a strong, random seed
   export ORACLE_SEED=$(openssl rand -hex 32)
   ```

2. **Store Oracle Private Key Securely**
   - Use environment variables
   - Consider hardware security modules
   - Implement key rotation procedures

3. **Implement Access Controls**
   - Only authorized services should have oracle access
   - Use IP whitelisting for oracle endpoints
   - Monitor oracle usage patterns

### Smart Contract Security
1. **Verify Program ID**
   - Always verify the program ID matches expected value
   - Use program-derived addresses (PDAs) for security

2. **Input Validation**
   - All inputs are validated in the smart contract
   - Implement additional validation in client code

3. **Error Handling**
   - Comprehensive error codes for different scenarios
   - Graceful handling of edge cases

## 📊 Monitoring and Maintenance

### 1. Program Monitoring
```bash
# Monitor program usage
solana logs <PROGRAM_ID>

# Check program account size
solana account <PROGRAM_ID> --output json

# Monitor oracle activity
solana logs --include <ORACLE_PUBKEY>
```

### 2. Health Checks
```javascript
// Implement health checks
async function checkProgramHealth() {
  try {
    const masterData = await client.getMasterData();
    return {
      status: 'healthy',
      totalMinted: masterData.totalMinted.toNumber(),
      authority: masterData.authority.toString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}
```

### 3. Backup Procedures
- **Regular Backups**: Backup oracle keypairs and configuration
- **State Snapshots**: Periodically snapshot program state
- **Recovery Procedures**: Document recovery procedures for different failure scenarios

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Fails**
   ```bash
   # Check Solana CLI version
   solana --version
   
   # Verify wallet has sufficient SOL
   solana balance
   
   # Check network connectivity
   solana cluster-version
   ```

2. **Program Not Found**
   ```bash
   # Verify program ID is correct
   solana program show <PROGRAM_ID>
   
   # Check if program was deployed to correct network
   anchor deploy --provider.cluster <NETWORK>
   ```

3. **Oracle Authorization Fails**
   ```bash
   # Verify oracle keypair matches master authority
   solana account <MASTER_PDA>
   
   # Check oracle seed is correct
   echo $ORACLE_SEED
   ```

4. **NFT Transfer Fails**
   - Verify escrow is completed (not soulbound)
   - Check recipient token account exists
   - Ensure sufficient SOL for transaction fees

### Support Resources
- **Solana Documentation**: https://docs.solana.com/
- **Anchor Documentation**: https://www.anchor-lang.com/
- **TrustLens Discord**: Join our community for support
- **GitHub Issues**: Report bugs and feature requests

## 📈 Scaling Considerations

### 1. Performance Optimization
- **Batch Operations**: Implement batch minting for multiple escrows
- **Pagination**: Add pagination for large data queries
- **Caching**: Implement caching for frequently accessed data

### 2. Cost Management
- **Transaction Optimization**: Minimize transaction size and compute units
- **Rent Management**: Monitor account rent requirements
- **Fee Estimation**: Implement dynamic fee estimation

### 3. Network Considerations
- **RPC Endpoints**: Use reliable RPC providers
- **Load Balancing**: Distribute load across multiple endpoints
- **Failover**: Implement failover mechanisms

---

## 🎉 Deployment Complete!

Your TrustLens NFT Receipt program is now deployed and ready for production use! 

### Next Steps:
1. ✅ **Test thoroughly** on devnet before mainnet deployment
2. ✅ **Secure your oracle keypair** with proper key management
3. ✅ **Integrate with your AI service** for automated updates
4. ✅ **Monitor program usage** and implement alerting
5. ✅ **Document your deployment** for team members

### Useful Commands:
```bash
# Check program status
solana program show <PROGRAM_ID>

# View program logs
solana logs <PROGRAM_ID>

# Get program account info
solana account <PROGRAM_ID>

# Monitor transactions
solana logs --include <ORACLE_PUBKEY>
```

Built with ❤️ for the TrustLens ecosystem - bridging Aeternity escrows with Solana NFTs! 🚀
