#!/usr/bin/env node

/**
 * TrustLens Integration Script
 * 
 * This script helps integrate the smart contract with the React frontend
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 TrustLens Integration Script');
console.log('==============================');

// Create contracts directory in frontend
const contractsDir = path.join(__dirname, 'frontend', 'src', 'contracts');
if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
}

// Copy contract file to frontend
const contractSource = fs.readFileSync(path.join(__dirname, 'escrhow.aes'), 'utf8');
fs.writeFileSync(path.join(contractsDir, 'Escrow.aes'), contractSource);

console.log('✅ Contract copied to frontend');

// Update package.json scripts
const frontendPackagePath = path.join(__dirname, 'frontend', 'package.json');
if (fs.existsSync(frontendPackagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
  
  // Add integration scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'contract:compile': 'aeproject build',
    'contract:deploy': 'node ../../deploy.js',
    'integration:setup': 'node ../integration-script.js',
    'frontend:dev': 'cd frontend && npm run dev',
    'frontend:build': 'cd frontend && npm run build',
    'install:all': 'npm install && cd frontend && npm install'
  };
  
  fs.writeFileSync(frontendPackagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated frontend package.json with integration scripts');
}

// Create deployment guide
const deploymentGuide = `
# TrustLens Deployment Guide

## Prerequisites

1. Install Node.js 18+ and npm
2. Install Aeternity CLI tools
3. Install Superhero Wallet browser extension

## Step 1: Install Dependencies

\`\`\`bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
\`\`\`

## Step 2: Deploy Smart Contract

\`\`\`bash
# Set environment variables
export AETERNITY_SECRET_KEY="your_secret_key"
export AETERNITY_PUBLIC_KEY="your_public_key"
export CLIENT_ADDRESS="ak_..."
export FREELANCER_ADDRESS="ak_..."
export MEDIATOR_ADDRESS="ak_..."

# Deploy contract
npm run contract:deploy
\`\`\`

## Step 3: Start Frontend

\`\`\`bash
# Development server
npm run frontend:dev

# Or build for production
npm run frontend:build
\`\`\`

## Configuration

Update the contract address in \`frontend/.env\` after deployment:

\`\`\`
VITE_CONTRACT_ADDRESS=ct_your_deployed_contract_address
\`\`\`

## Network Configuration

The application is configured for Aeternity testnet by default. Update the following for mainnet:

- Node URLs in \`deploy.js\`
- Network ID in frontend environment
- Contract addresses
`;

fs.writeFileSync(path.join(__dirname, 'DEPLOYMENT.md'), deploymentGuide);
console.log('✅ Created deployment guide');

// Create development workflow guide
const devGuide = `
# TrustLens Development Workflow

## Project Structure

\`\`\`
trustlens/
├── escrhow.aes              # Sophia smart contract
├── deploy.js               # Contract deployment script
├── package.json            # Backend dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # Contract service
│   │   └── contracts/      # Contract source files
│   └── package.json        # Frontend dependencies
└── README.md
\`\`\`

## Development Commands

\`\`\`bash
# Install all dependencies
npm run install:all

# Start development (both contract and frontend)
npm run frontend:dev

# Compile smart contract
npm run contract:compile

# Deploy contract
npm run contract:deploy

# Build frontend for production
npm run frontend:build
\`\`\`

## Development Process

1. **Contract Development**: Edit \`escrhow.aes\`
2. **Test Contract**: Run tests with \`npm run contract:compile\`
3. **Deploy Contract**: Use \`npm run contract:deploy\`
4. **Frontend Development**: Edit React components in \`frontend/src/\`
5. **Test Integration**: Run frontend with \`npm run frontend:dev\`

## Integration Points

- Contract address should be updated in frontend environment
- Contract ABI updates require frontend rebuild
- New contract functions need corresponding UI components

## Testing

1. Use Aeternity testnet for development
2. Test with small amounts first
3. Verify all contract functions work correctly
4. Test wallet interactions thoroughly

## Troubleshooting

- Ensure Superhero Wallet is installed and unlocked
- Check network configuration (testnet vs mainnet)
- Verify account has sufficient balance
- Check contract deployment logs for errors
`;

fs.writeFileSync(path.join(__dirname, 'DEVELOPMENT.md'), devGuide);
console.log('✅ Created development workflow guide');

console.log('\n🎉 Integration setup complete!');
console.log('\nNext steps:');
console.log('1. Run: npm run install:all');
console.log('2. Configure environment variables');
console.log('3. Run: npm run frontend:dev');
console.log('\nCheck DEPLOYMENT.md and DEVELOPMENT.md for detailed guides.');
