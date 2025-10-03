# TrustLens Frontend

A modern React application for interacting with escrow smart contracts on the Aeternity blockchain using Superhero Wallet.

## Features

- 🔗 **Superhero Wallet Integration** - Seamless wallet connection and interactions
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development and builds
- 🎨 **Modern UI** - Clean, professional interface with Tailwind CSS
- 📊 **Real-time Status** - Transaction tracking and status updates
- 🔒 **Secure** - Production-ready with proper error handling and validation

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Lucide React (icons)
- **Blockchain**: Aeternity SDK + Superhero Wallet
- **State Management**: React Context + Hooks
- **Notifications**: React Hot Toast

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Usage

### Wallet Connection

The app automatically detects and connects to Superhero Wallet. Users can:
- Connect their wallet with one click
- View their balance and account information
- Disconnect when done

### Contract Interaction

Users can either:
1. **Connect to Existing Contract** - Enter a contract address to interact with an existing escrow
2. **Deploy New Contract** - Create a new escrow contract with specified parameters

### Available Actions

- **Deposit** - Client deposits funds into escrow
- **Release** - Release funds to freelancer (Client/Mediator only)
- **Dispute** - Raise a dispute for mediator resolution
- **Refund** - Process refund for disputed contracts (Mediator only)

### Transaction Tracking

All transactions are tracked with:
- Real-time status updates
- Transaction hash display
- Gas usage information
- Direct links to Aeternity blockchain explorer

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── WalletConnection.jsx
│   ├── ContractForm.jsx
│   ├── ContractActions.jsx
│   └── TransactionStatus.jsx
├── contexts/           # React contexts
│   └── WalletContext.jsx
├── services/           # Business logic
│   └── ContractService.js
├── App.jsx            # Main application
├── main.jsx          # Entry point
└── index.css         # Global styles
```

### Key Components

- **WalletContext** - Manages wallet connection state and account information
- **ContractService** - Handles all blockchain interactions and contract calls
- **ContractForm** - Form component for contract deployment and connection
- **ContractActions** - Action buttons for contract interactions
- **TransactionStatus** - Displays transaction status and details

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### Environment Variables

- `VITE_NETWORK_ID` - Aeternity network ID (ae_uat for testnet)
- `VITE_NODE_URL` - Aeternity node URL
- `VITE_INTERNAL_URL` - Internal node URL
- `VITE_CONTRACT_ADDRESS` - Default contract address

### Network Configuration

The app is configured for Aeternity testnet by default. To switch to mainnet:

1. Update `VITE_NETWORK_ID` to `ae_mainnet`
2. Update node URLs to mainnet endpoints
3. Update contract addresses if needed

## Security Features

- **Input Validation** - All user inputs are validated before processing
- **Error Handling** - Comprehensive error handling with user-friendly messages
- **Transaction Verification** - Transaction status and hash verification
- **Access Control** - Role-based access control for contract actions

## Browser Support

- Chrome/Chromium (recommended for Superhero Wallet)
- Firefox
- Safari
- Edge

## Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Static Hosting

You can deploy the built application to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Environment Setup

Configure the production environment variables before deployment to ensure proper network configuration.

## License

MIT License - Built for the Aeternity ecosystem
