#!/bin/bash

# TrustLens NFT Receipt - Local Development Setup Script

echo "🚀 Setting up TrustLens NFT Receipt for local development..."

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install Solana CLI first."
    echo "   Run: sh -c \"\$(curl -sSfL https://release.solana.com/v1.17.0/install)\""
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install Anchor first."
    echo "   Run: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    echo "   Then: avm install latest && avm use latest"
    exit 1
fi

# Set up Solana configuration
echo "📡 Configuring Solana for local development..."
solana config set --url localhost
solana config set --keypair ~/.config/solana/id.json

# Check if keypair exists
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Creating Solana keypair..."
    solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase
fi

# Start local validator in background
echo "🔧 Starting local Solana validator..."
if pgrep -f "solana-test-validator" > /dev/null; then
    echo "✅ Solana validator already running"
else
    solana-test-validator --reset --quiet &
    VALIDATOR_PID=$!
    echo "✅ Solana validator started (PID: $VALIDATOR_PID)"
    
    # Wait for validator to be ready
    echo "⏳ Waiting for validator to be ready..."
    sleep 5
    
    # Check if validator is responding
    for i in {1..10}; do
        if solana cluster-version &> /dev/null; then
            echo "✅ Validator is ready!"
            break
        fi
        echo "⏳ Waiting for validator... ($i/10)"
        sleep 2
    done
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the program
echo "🔨 Building Anchor program..."
anchor build

# Deploy the program
echo "🚀 Deploying program to localnet..."
anchor deploy

# Set up environment variables
echo "🔧 Setting up environment variables..."
export CLUSTER=localnet
export ORACLE_SEED=trustlens-oracle-localnet

# Initialize the program
echo "🎯 Initializing program..."
npm run deploy

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 What's been set up:"
echo "   ✅ Solana local validator running"
echo "   ✅ Program deployed to localnet"
echo "   ✅ Program initialized with oracle"
echo "   ✅ Dependencies installed"
echo ""
echo "🔗 Useful commands:"
echo "   • Run tests: npm test"
echo "   • Check logs: solana logs"
echo "   • View accounts: solana account <address>"
echo "   • Stop validator: pkill -f solana-test-validator"
echo ""
echo "📊 Program Info:"
echo "   • Program ID: $(grep 'declare_id' programs/trustlens-nft-receipt/src/lib.rs | cut -d'"' -f2)"
echo "   • Oracle Seed: $ORACLE_SEED"
echo ""
echo "🚀 Ready for development!"
