# 🚀 TrustLens Escrow Contract - Aeternity Testnet Deployment Guide

This guide will walk you through deploying the TrustLens Sophia escrow contract to the Aeternity testnet using AEproject and the Aeternity SDK.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Basic understanding of blockchain concepts
- Testnet AE tokens for gas fees

## 🛠️ Installation & Setup

### Step 1: Install AEproject Globally

```bash
npm install -g aeproject
```

Verify installation:
```bash
aeproject --version
```

### Step 2: Install Project Dependencies

```bash
# Navigate to project root
cd /path/to/trustlens

# Install dependencies
npm install

# Or use the setup script
npm run setup
```

### Step 3: Verify Project Structure

Your project should have this structure:
```
trustlens/
├── contracts/
│   └── TrustLensEscrow.aes
├── deployment/
│   ├── deploy.js
│   ├── account.json.example
│   └── deployment-info.json (created after deployment)
├── aeproject.yaml
├── package.json
└── DEPLOYMENT_GUIDE.md
```

## 🔧 Configuration

### Testnet Configuration

The deployment is pre-configured for Aeternity testnet:

```yaml
# aeproject.yaml
networks:
  testnet:
    url: https://testnet.aeternity.io
    compilerUrl: https://compiler.aepps.com
    internalUrl: https://sdk-testnet.aepps.com
    gas: 200000
    gasPrice: 1000000000
```

### Contract Configuration

Default deployment parameters in `deployment/deploy.js`:
- **Client**: Deployer address
- **Freelancer**: Example address (modify as needed)
- **Mediator**: Example address (modify as needed)
- **Amount**: 1 AE (1000000000000000000 aettos)
- **Deadline**: 30 days from deployment
- **Description**: "TrustLens escrow contract deployment test"

## 🚀 Deployment Process

### Step 1: Fund Your Account

**IMPORTANT**: You need testnet AE tokens to pay for deployment gas fees.

1. **Get Testnet Tokens**:
   - Go to [Aeternity Testnet Faucet](https://testnet.faucet.aepps.com/)
   - Enter your wallet address
   - Request testnet tokens
   - Wait for confirmation

2. **Alternative Faucets**:
   - [Testnet Faucet 2](https://faucet.aepps.com/)
   - [Community Faucets](https://forum.aeternity.com/)

### Step 2: Run Deployment

```bash
# Option 1: Use npm script
npm run deploy

# Option 2: Direct execution
node deployment/deploy.js

# Option 3: With network specification
npm run deploy:testnet
```

### Step 3: Monitor Deployment

The deployment script will:

1. ✅ **Load/Create Account**: Load existing account or create new one
2. ✅ **Connect to Testnet**: Establish connection to Aeternity testnet
3. ✅ **Check Balance**: Verify sufficient funds for deployment
4. ✅ **Compile Contract**: Compile Sophia contract to bytecode
5. ✅ **Deploy Contract**: Deploy to testnet with specified parameters
6. ✅ **Verify Deployment**: Call contract methods to verify functionality
7. ✅ **Save Info**: Store deployment details for future reference

## 📊 Expected Console Output

```bash
🚀 Starting TrustLens Escrow Contract Deployment
🌐 Network: Aeternity Testnet
============================================================
🆕 Creating new testnet account...
💾 Account saved to account.json
🔑 Public Key: ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
📍 Address: ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
⚠️  IMPORTANT: Keep the secret key secure and fund this account with testnet AE tokens!
🔌 Connecting to Aeternity testnet...
✅ Connected to testnet successfully
💰 Account balance: 0.0000 AE (0 aettos)
⚠️  WARNING: Account has insufficient balance for deployment!
💡 Please fund your account with testnet AE tokens:
   1. Go to: https://testnet.faucet.aepps.com/
   2. Enter address: ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
   3. Request testnet tokens
   4. Wait for confirmation and try deployment again
❌ Deployment aborted due to insufficient funds
```

After funding:
```bash
💰 Account balance: 10.0000 AE (10000000000000000000 aettos)
📦 Reading contract source...
✅ Contract source loaded (1234 characters)
🔨 Compiling contract...
✅ Contract compiled successfully
🚀 Deploying contract to testnet...
🎉 Contract deployed successfully!
📍 Contract Address: ct_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
🔗 Transaction Hash: th_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
⛽ Gas Used: 150000
💾 Deployment info saved to deployment-info.json
🔍 Verifying deployment...
✅ Contract verification successful
📋 Project details: [client, freelancer, mediator, amount, deadline, disputed, description]
============================================================
🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!
============================================================
📍 Contract Address: ct_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
🔗 View on Explorer: https://explorer.aeternity.io/transactions/th_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
🔗 View Contract: https://explorer.aeternity.io/contracts/ct_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
============================================================
```

## 🔍 Verification

### 1. Aeternity Explorer

Visit the contract on [Aeternity Explorer](https://explorer.aeternity.io/):
- **Transaction**: `https://explorer.aeternity.io/transactions/{TX_HASH}`
- **Contract**: `https://explorer.aeternity.io/contracts/{CONTRACT_ADDRESS}`

### 2. Contract Interaction

The deployed contract supports these functions:

```javascript
// Get project details
const details = await contractInstance.methods.get_project_details();

// Deposit funds (client only)
await contractInstance.methods.deposit({ amount: 1000000000000000000 });

// Release funds (client/mediator only)
await contractInstance.methods.release();

// Raise dispute (client/freelancer only)
await contractInstance.methods.dispute("Reason for dispute");

// Refund disputed funds (client/mediator only)
await contractInstance.methods.refund();
```

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. **"Insufficient balance" Error**
```
❌ Error: Insufficient balance for deployment
```
**Solution**:
- Fund your account with testnet tokens from faucet
- Wait for transaction confirmation
- Check balance with: `node -e "console.log('Check account.json for balance')"`

#### 2. **"Connection failed" Error**
```
❌ Error: Failed to connect to testnet
```
**Solutions**:
- Check internet connection
- Verify testnet URL is accessible
- Try alternative RPC endpoints
- Check firewall settings

#### 3. **"Compilation failed" Error**
```
❌ Error: Contract compilation failed
```
**Solutions**:
- Verify Sophia syntax in `contracts/TrustLensEscrow.aes`
- Check compiler version compatibility
- Ensure all required functions are implemented

#### 4. **"Gas limit exceeded" Error**
```
❌ Error: Gas limit exceeded
```
**Solutions**:
- Increase gas limit in `aeproject.yaml`
- Optimize contract code
- Check for infinite loops or complex operations

#### 5. **"Account not found" Error**
```
❌ Error: Account file not found
```
**Solutions**:
- Run deployment script to create new account
- Copy `account.json.example` to `account.json`
- Ensure account has sufficient balance

### Debug Commands

```bash
# Check deployment status
npm run status

# Clean deployment files
npm run clean

# Verify dependencies
npm list @aeternity/aepp-sdk

# Test network connectivity
curl -s https://testnet.aeternity.io/v2/status
```

### Getting Help

1. **Check Logs**: Review console output for specific error messages
2. **Aeternity Docs**: [Official Documentation](https://docs.aeternity.io/)
3. **Community Forum**: [Aeternity Forum](https://forum.aeternity.com/)
4. **GitHub Issues**: Report bugs on project repository
5. **Discord**: Join Aeternity community Discord

## 📁 Generated Files

After successful deployment, these files will be created:

### `deployment/account.json`
```json
{
  "publicKey": "ak_...",
  "secretKey": "...",
  "address": "ak_...",
  "note": "Keep secret key secure!"
}
```

### `deployment/deployment-info.json`
```json
{
  "contractAddress": "ct_...",
  "transactionHash": "th_...",
  "deployerAddress": "ak_...",
  "deployParams": {
    "client": "ak_...",
    "freelancer": "ak_...",
    "mediator": "ak_...",
    "amount": 1000000000000000000,
    "deadline": 1234567890,
    "project_description": "TrustLens escrow contract deployment test"
  },
  "deployedAt": "2024-01-01T00:00:00.000Z",
  "network": "testnet"
}
```

## 🔄 Re-deployment

To deploy a new version:

```bash
# Clean previous deployment
npm run clean

# Deploy new version
npm run deploy
```

## 🎯 Next Steps

After successful deployment:

1. **Update Frontend**: Update contract address in React app
2. **Test Functions**: Verify all contract functions work correctly
3. **Integration**: Connect frontend to deployed contract
4. **Production**: Deploy to mainnet (when ready)

## 📞 Support

For deployment issues or questions:
- **Email**: support@trustlens.io
- **GitHub**: Create an issue in the repository
- **Documentation**: Check this guide and inline code comments

---

**Happy Deploying! 🚀**
