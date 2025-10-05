# 🚀 TrustLens Smart Contract Deployment Guide

## ⚠️ Current Status
The current contract address `ct_mgcu3hf44v523o840mx` is a **mock/demo address** and does not exist on the blockchain.

## 📋 Manual Deployment Steps

### Step 1: Get Testnet AE Tokens
1. Go to [Aeternity Testnet Faucet](https://testnet.faucet.aepps.com/)
2. Enter your wallet address
3. Request testnet tokens (you need at least 0.5 AE for deployment)

### Step 2: Deploy Contract
1. Go to [Aeternity Testnet Compiler](https://compiler.aepps.com/)
2. Copy the contract source code from `deployment/TrustLensEscrow.aes`
3. Paste it into the compiler
4. Set deployment parameters:
   - **Client Address**: Your wallet address
   - **Freelancer Address**: Example freelancer address
   - **Mediator Address**: Example mediator address
   - **Amount**: `1000000000000000000` (1 AE in aettos)
   - **Deadline**: `1762292472` (30 days from now)
   - **Project Description**: "TrustLens escrow contract deployment"
5. Click "Deploy" and sign the transaction
6. Wait for confirmation

### Step 3: Update Configuration
After successful deployment, you'll get:
- **Contract Address**: `ct_...` (starts with ct_)
- **Transaction Hash**: `th_...` (starts with th_)
- **Your Wallet Address**: `ak_...` (starts with ak_)

Run this command to update the configuration:
```bash
node deployment/update-config.js <contract-address> <transaction-hash> <deployer-address>
```

Example:
```bash
node deployment/update-config.js ct_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v th_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v
```

## 🔍 Verification

### Check on Explorer
- **Contract**: `https://testnet.aescan.io/contracts/{CONTRACT_ADDRESS}`
- **Transaction**: `https://testnet.aescan.io/transactions/{TRANSACTION_HASH}`

### Test Contract Functions
The deployed contract supports:
- `deposit()` - Client deposits funds
- `release()` - Release funds to freelancer
- `dispute(reason)` - Raise a dispute
- `refund()` - Refund disputed funds
- `get_project_details()` - Get project information

## 📄 Contract Features

✅ **Three-party escrow system** (Client, Freelancer, Mediator)  
✅ **Dispute resolution mechanism**  
✅ **Automatic fund release/refund**  
✅ **Event logging for all actions**  
✅ **State querying functions**  
✅ **Sophia smart contract on Aeternity blockchain**  

## 🛠️ Alternative Deployment Methods

### Method 1: Using AEProject (Advanced)
```bash
# Install AEProject globally
npm install -g aeproject

# Initialize project
aeproject init

# Deploy contract
aeproject deploy
```

### Method 2: Using SDK (Node.js)
```bash
# Install dependencies
npm install @aeternity/aepp-sdk

# Run deployment script
node deployment/deploy.js
```

### Method 3: Browser Extension
1. Install Aeternity wallet browser extension
2. Use the compiler interface at https://compiler.aepps.com/
3. Connect wallet and deploy directly

## 🚨 Troubleshooting

### Common Issues:
1. **"Insufficient balance"** - Get more testnet tokens from faucet
2. **"Contract not found"** - Verify the contract address is correct
3. **"Compilation failed"** - Check Sophia syntax in contract source
4. **"Transaction failed"** - Check gas limits and network connectivity

### Support Resources:
- [Aeternity Documentation](https://docs.aeternity.io/)
- [Sophia Language Guide](https://docs.aeternity.io/aeternity-sophia/)
- [Community Forum](https://forum.aeternity.com/)
- [Discord Community](https://discord.gg/aeternity)

## 📞 Need Help?

If you encounter issues:
1. Check the deployment logs
2. Verify your wallet has sufficient testnet tokens
3. Ensure the contract source code is correct
4. Check network connectivity to Aeternity testnet

---

**🎯 Goal**: Deploy a real Sophia smart contract to Aeternity testnet and update the configuration with the actual contract address.
