#!/bin/bash

# TrustLens Escrow Contract - Deployment Setup Script
# This script sets up the environment for deploying to Aeternity testnet

echo "🚀 TrustLens Escrow Contract - Deployment Setup"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install AEproject globally
echo "📦 Installing AEproject globally..."
if npm install -g aeproject; then
    echo "✅ AEproject installed successfully"
    echo "   Version: $(aeproject --version)"
else
    echo "❌ Failed to install AEproject"
    echo "   Try running: sudo npm install -g aeproject"
    exit 1
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
if npm install; then
    echo "✅ Project dependencies installed successfully"
else
    echo "❌ Failed to install project dependencies"
    exit 1
fi

# Create deployment directory if it doesn't exist
if [ ! -d "deployment" ]; then
    mkdir -p deployment
    echo "✅ Created deployment directory"
fi

# Copy example account file if account.json doesn't exist
if [ ! -f "deployment/account.json" ]; then
    if [ -f "deployment/account.json.example" ]; then
        cp deployment/account.json.example deployment/account.json
        echo "✅ Created account.json from example"
        echo "⚠️  IMPORTANT: Update deployment/account.json with your testnet account details"
    fi
fi

# Check if contract file exists
if [ ! -f "contracts/TrustLensEscrow.aes" ]; then
    echo "❌ Contract file not found: contracts/TrustLensEscrow.aes"
    echo "   Please ensure the contract file exists before deployment"
    exit 1
fi

echo "✅ Contract file found: contracts/TrustLensEscrow.aes"

# Test network connectivity
echo "🌐 Testing network connectivity..."
if curl -s --connect-timeout 10 https://testnet.aeternity.io/v2/status > /dev/null; then
    echo "✅ Aeternity testnet is accessible"
else
    echo "⚠️  Warning: Cannot connect to Aeternity testnet"
    echo "   Check your internet connection and firewall settings"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Fund your testnet account with AE tokens:"
echo "   https://testnet.faucet.aepps.com/"
echo ""
echo "2. Update deployment parameters in:"
echo "   deployment/deploy.js"
echo ""
echo "3. Deploy the contract:"
echo "   npm run deploy"
echo ""
echo "4. Check deployment status:"
echo "   npm run status"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
echo "🚀 Ready for deployment!"
