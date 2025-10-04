# 🚀 Real Aeternity Testnet Deployment Guide

## ⚠️ Important Note

The mock deployment above demonstrates the complete process, but for **real deployment** to Aeternity testnet, you need to resolve the Node.js v24 compatibility issues with the Aeternity SDK.

## 🔧 Real Deployment Setup

### Option 1: Use Node.js v18 (Recommended)

```bash
# Install Node.js v18 using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify Node.js version
node --version  # Should show v18.x.x

# Install dependencies
npm install

# Deploy to testnet
npm run deploy
```

### Option 2: Use Docker (Alternative)

```bash
# Create Dockerfile for deployment
cat > Dockerfile.deploy << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "deploy"]
EOF

# Build and run deployment
docker build -f Dockerfile.deploy -t trustlens-deploy .
docker run --rm -v $(pwd)/deployment:/app/deployment trustlens-deploy
```

### Option 3: Use Aeternity CLI (Traditional)

```bash
# Install Aeternity CLI
curl -L https://github.com/aeternity/aeternity/releases/latest/download/aeternity-macos.tar.gz | tar -xz
sudo mv aeternity /usr/local/bin/

# Deploy using CLI
aeternity contract deploy contracts/TrustLensEscrow.aes --init "('ak_client123', 'ak_freelancer123', 'ak_mediator123', 1000000000000000000, 1762208272, 'TrustLens escrow')"
```

## 📋 Real Deployment Steps

### 1. Environment Setup
```bash
# Use Node.js v18
nvm use 18

# Install AEproject globally
npm install -g aeproject

# Install project dependencies
npm install
```

### 2. Account Setup
```bash
# Create testnet account
node -e "
const { MemoryAccount } = require('@aeternity/aepp-sdk');
const fs = require('fs');
const account = MemoryAccount.generate();
const accountData = {
  publicKey: account.publicKey,
  secretKey: account.secretKey,
  address: account.address
};
fs.writeFileSync('deployment/account.json', JSON.stringify(accountData, null, 2));
console.log('Account created:', account.address);
"
```

### 3. Fund Account
1. Go to [Aeternity Testnet Faucet](https://testnet.faucet.aepps.com/)
2. Enter your account address
3. Request testnet AE tokens
4. Wait for confirmation

### 4. Deploy Contract
```bash
# Deploy to testnet
npm run deploy

# Expected output:
# 🚀 Starting TrustLens Escrow Contract Deployment
# 🌐 Network: Aeternity Testnet
# ✅ Contract deployed successfully!
# 📍 Contract Address: ct_...
```

### 5. Verify Deployment
```bash
# Test deployed contract
npm test

# Check on Aeternity Explorer
# https://explorer.aeternity.io/contracts/{CONTRACT_ADDRESS}
```

## 🔍 Verification Checklist

✅ **Deployment Verification**
- [ ] Contract address generated
- [ ] Transaction hash received
- [ ] Gas usage within limits
- [ ] Contract appears on Aeternity Explorer

✅ **Contract Testing**
- [ ] `get_project_details()` returns correct data
- [ ] `get_state()` returns contract state
- [ ] All 6 functions are callable
- [ ] Contract balance is accessible

✅ **Integration Testing**
- [ ] Frontend can connect to contract
- [ ] Wallet integration works
- [ ] Contract calls execute successfully
- [ ] Events are emitted correctly

## 🛠️ Troubleshooting Real Deployment

### Common Issues

#### 1. Node.js Version Compatibility
```bash
# Error: argon2 compilation failed
# Solution: Use Node.js v18
nvm install 18
nvm use 18
```

#### 2. Network Connection Issues
```bash
# Error: Failed to connect to testnet
# Solutions:
curl -s https://testnet.aeternity.io/v2/status
# Try alternative RPC endpoints
```

#### 3. Insufficient Balance
```bash
# Error: Insufficient balance for deployment
# Solution: Fund account with testnet tokens
# https://testnet.faucet.aepps.com/
```

#### 4. Contract Compilation Errors
```bash
# Error: Contract compilation failed
# Solutions:
# 1. Check Sophia syntax
# 2. Verify compiler version
# 3. Ensure all functions are implemented
```

## 📊 Real vs Mock Deployment

| Feature | Mock Deployment | Real Deployment |
|---------|----------------|-----------------|
| **Speed** | Instant | 2-5 minutes |
| **Cost** | Free | Gas fees |
| **Network** | Simulated | Aeternity Testnet |
| **Persistence** | Local files | Blockchain |
| **Verification** | Mock checks | Real contract calls |
| **Explorer** | Mock links | Real Aeternity Explorer |

## 🎯 Next Steps After Real Deployment

1. **Update Frontend**: Replace mock contract address with real one
2. **Test Integration**: Verify wallet connection and contract calls
3. **User Testing**: Test complete escrow workflow
4. **Mainnet Deployment**: Deploy to Aeternity mainnet when ready

## 📞 Support

For real deployment issues:
- **Aeternity Docs**: [Official Documentation](https://docs.aeternity.io/)
- **Community Forum**: [Aeternity Forum](https://forum.aeternity.com/)
- **GitHub Issues**: Report bugs on project repository
- **Discord**: Join Aeternity community Discord

---

**The mock deployment demonstrates the complete process. For production use, resolve the Node.js compatibility issues and deploy to real testnet! 🚀**
