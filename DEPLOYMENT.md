
# TrustLens Deployment Guide

## Prerequisites

1. Install Node.js 18+ and npm
2. Install Aeternity CLI tools
3. Install Superhero Wallet browser extension

## Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

## Step 2: Deploy Smart Contract

```bash
# Set environment variables
export AETERNITY_SECRET_KEY="your_secret_key"
export AETERNITY_PUBLIC_KEY="your_public_key"
export CLIENT_ADDRESS="ak_..."
export FREELANCER_ADDRESS="ak_..."
export MEDIATOR_ADDRESS="ak_..."

# Deploy contract
npm run contract:deploy
```

## Step 3: Start Frontend

```bash
# Development server
npm run frontend:dev

# Or build for production
npm run frontend:build
```

## Configuration

Update the contract address in `frontend/.env` after deployment:

```
VITE_CONTRACT_ADDRESS=ct_your_deployed_contract_address
```

## Network Configuration

The application is configured for Aeternity testnet by default. Update the following for mainnet:

- Node URLs in `deploy.js`
- Network ID in frontend environment
- Contract addresses
