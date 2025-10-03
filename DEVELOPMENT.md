
# TrustLens Development Workflow

## Project Structure

```
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
```

## Development Commands

```bash
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
```

## Development Process

1. **Contract Development**: Edit `escrhow.aes`
2. **Test Contract**: Run tests with `npm run contract:compile`
3. **Deploy Contract**: Use `npm run contract:deploy`
4. **Frontend Development**: Edit React components in `frontend/src/`
5. **Test Integration**: Run frontend with `npm run frontend:dev`

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
