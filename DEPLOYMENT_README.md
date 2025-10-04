# 🚀 Quick Deployment Guide - TrustLens Escrow Contract

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
# Install AEproject globally
npm install -g aeproject

# Install project dependencies
npm install
```

### 2. Fund Your Account
```bash
# Get testnet tokens from faucet
open https://testnet.faucet.aepps.com/
```

### 3. Deploy Contract
```bash
# Deploy to testnet
npm run deploy
```

### 4. Test Deployment
```bash
# Test deployed contract
npm test
```

## 📋 Complete Deployment Steps

### Step 1: Environment Setup
```bash
# Check Node.js version (v16+ required)
node --version

# Install AEproject globally
npm install -g aeproject

# Verify installation
aeproject --version
```

### Step 2: Project Setup
```bash
# Clone and navigate to project
cd trustlens

# Install dependencies
npm install

# Run setup script (optional)
npm run setup:deployment
```

### Step 3: Account Funding
1. **Get Testnet Tokens**:
   - Visit: https://testnet.faucet.aepps.com/
   - Enter your wallet address (will be shown during deployment)
   - Request testnet AE tokens
   - Wait for confirmation

2. **Alternative Faucets**:
   - https://faucet.aepps.com/
   - Community faucets on Aeternity forum

### Step 4: Deploy Contract
```bash
# Deploy to testnet
npm run deploy

# Expected output:
# 🚀 Starting TrustLens Escrow Contract Deployment
# 🌐 Network: Aeternity Testnet
# ✅ Contract deployed successfully!
# 📍 Contract Address: ct_...
```

### Step 5: Verify Deployment
```bash
# Test contract functionality
npm test

# Check deployment status
npm run status
```

## 🔧 Configuration

### Contract Parameters
Edit `deployment/deploy.js` to customize:

```javascript
const deployParams = {
  client: 'ak_...',           // Client address
  freelancer: 'ak_...',       // Freelancer address  
  mediator: 'ak_...',         // Mediator address
  amount: 1000000000000000000, // 1 AE in aettos
  deadline: 1234567890,       // Unix timestamp
  project_description: '...'  // Project description
};
```

### Network Configuration
Edit `aeproject.yaml`:

```yaml
networks:
  testnet:
    url: https://testnet.aeternity.io
    compilerUrl: https://compiler.aepps.com
    gas: 200000
    gasPrice: 1000000000
```

## 📊 Expected Output

### Successful Deployment
```bash
🎉 Contract deployed successfully!
📍 Contract Address: ct_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
🔗 Transaction Hash: th_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
⛽ Gas Used: 150000
✅ Contract verification successful
```

### Contract Testing
```bash
🧪 Testing deployed contract...
✅ Project details retrieved successfully:
   Client: ak_...
   Freelancer: ak_...
   Mediator: ak_...
   Amount: 1000000000000000000
   Deadline: 2024-02-01T00:00:00.000Z
   Disputed: false
   Description: TrustLens escrow contract deployment test
✅ Contract state retrieved successfully
✅ Contract balance: 0.0000 AE
🎉 Contract testing completed successfully!
```

## 🔍 Verification Links

After deployment, verify on:
- **Aeternity Explorer**: https://explorer.aeternity.io/contracts/{CONTRACT_ADDRESS}
- **Transaction**: https://explorer.aeternity.io/transactions/{TX_HASH}

## 🛠️ Troubleshooting

### Common Issues

#### 1. Insufficient Balance
```bash
❌ WARNING: Account has insufficient balance for deployment!
```
**Solution**: Fund account with testnet tokens from faucet

#### 2. Connection Failed
```bash
❌ Error: Failed to connect to testnet
```
**Solutions**:
- Check internet connection
- Try alternative RPC endpoints
- Check firewall settings

#### 3. Compilation Failed
```bash
❌ Error: Contract compilation failed
```
**Solutions**:
- Verify Sophia syntax
- Check compiler version
- Ensure all functions implemented

### Debug Commands
```bash
# Check deployment status
npm run status

# Clean deployment files
npm run clean

# Get help
npm run help

# Test network connectivity
curl -s https://testnet.aeternity.io/v2/status
```

## 📁 Generated Files

After deployment:
- `deployment/account.json` - Your testnet account details
- `deployment/deployment-info.json` - Deployment information
- Console output with contract address and transaction hash

## 🔄 Re-deployment

```bash
# Clean previous deployment
npm run clean

# Deploy new version
npm run deploy
```

## 📞 Support

- **Documentation**: See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Issues**: Create GitHub issue for bugs
- **Community**: Aeternity forum and Discord

---

**Ready to deploy? Run `npm run deploy` and follow the prompts! 🚀**
