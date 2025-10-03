# TrustLens Escrow Contract

A secure Sophia smart contract for escrow functionality on the Aeternity blockchain.

## Features

- **Deposit**: Clients can deposit funds securely
- **Release**: Authorized release of funds to freelancers
- **Dispute**: Dispute resolution mechanism with mediator
- **Access Control**: Role-based authorization for all functions
- **Events**: Comprehensive event logging for transparency

## Contract Functions

### `deposit()`
- Payable function for clients to deposit escrow funds
- Validates minimum deposit amount
- Emits deposit events

### `release()`
- Releases funds to freelancer
- Only executable by client or mediator
- Cannot release disputed funds

### `dispute(reason: string)`
- Initiates dispute resolution process
- Available to client or freelancer
- Escalates to mediator for resolution

### `get_project_details()`
- Public function to view contract state
- Returns all project information

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your actual addresses and keys
```

3. Compile contract:
```bash
npm run compile
```

4. Deploy contract:
```bash
npm run deploy
```

## Usage Example

```javascript
// Initialize contract with parameters
const contractParams = {
  client: 'ak_2a1j2Mk9xSm2nQJv...',
  freelancer: 'ak_2b1k3Nl0yTn3oRJw...',
  mediator: 'ak_2c1l4Om1zUo4pSKx...',
  amount: 1000000000000000000, // 1 AE
  deadline: 1735689600 // UNIX timestamp
};

// Deploy and interact with the contract
const contract = await client.contractDeploy(contractSource, contractParams);
```

## Security Features

- Role-based access control
- State validation
- Require statements
- Event logging for audit trails
- Dispute resolution mechanism

## Network Deployment

The contract is configured for Aeternity testnet deployment. Modify the network configuration in `deploy.js` for mainnet deployment.

## Events

- `FundDeposited`: Emitted when funds are deposited
- `FundReleased`: Emitted when funds are released to freelancer
- `DisputeRaised`: Emitted when dispute is initiated

## License

MIT License
