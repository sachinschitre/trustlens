# TrustLens Cross-Chain Sync Service

A lightweight Node.js/TypeScript service that synchronizes escrow events between Aeternity and Solana blockchains. This service acts as a bridge, listening to Aeternity smart contract events and triggering corresponding actions on Solana (NFT minting and metadata updates).

## 🚀 Features

### Core Functionality
- **Real-time Event Monitoring**: Listens to Aeternity smart contract events (deposit, release, dispute)
- **Cross-chain NFT Minting**: Automatically mints Solana NFTs for new escrow deals
- **Dynamic Status Updates**: Updates NFT metadata when escrow status changes
- **Oracle Authorization**: Secure minting and updates using authorized oracle
- **Modular Architecture**: Designed for easy integration with bridges like Wormhole

### Supported Events
- **FundDeposited**: Triggers NFT minting for new escrow deals
- **FundReleased**: Updates NFT status to "released"
- **DisputeRaised**: Updates NFT status to "disputed"
- **FundRefunded**: Updates NFT status to "disputed" (refunded)

### Technical Features
- **WebSocket + HTTP Polling**: Dual monitoring approach for reliability
- **Queue Management**: Batched operations with retry logic
- **Health Monitoring**: Comprehensive health checks and metrics
- **Error Handling**: Robust error handling with automatic retries
- **Configuration Management**: Environment-based configuration
- **Docker Support**: Containerized deployment with health checks

## 📋 Prerequisites

### Required Software
```bash
# Node.js 18+
node --version

# TypeScript
npm install -g typescript

# Docker (optional)
docker --version
```

### Required Services
- **Aeternity Node**: Access to Aeternity blockchain (testnet/mainnet)
- **Solana RPC**: Access to Solana blockchain (devnet/mainnet)
- **TrustLens NFT Program**: Deployed Solana NFT receipt program

## 🔧 Installation & Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd cross-chain-sync-service
npm install
```

### 2. Configuration
```bash
# Copy environment template
cp env.example .env

# Edit configuration
nano .env
```

### 3. Build
```bash
# Build TypeScript
npm run build

# Or run in development mode
npm run dev
```

### 4. Start Service
```bash
# Production mode
npm start

# Development mode with hot reload
npm run dev:watch
```

## ⚙️ Configuration

### Environment Variables

#### Server Configuration
```bash
PORT=3003                                    # Service port
HOST=localhost                               # Service host
NODE_ENV=development                         # Environment
CORS_ORIGINS=http://localhost:3000          # Allowed origins
```

#### Aeternity Configuration
```bash
AETERNITY_NETWORK=testnet                    # Network (testnet/mainnet)
AETERNITY_RPC_URL=https://testnet.aeternity.io
AETERNITY_WS_URL=wss://testnet.aeternity.io/websocket
AETERNITY_CONTRACT_ADDRESS=                  # Specific contract (optional)
AETERNITY_POLLING_INTERVAL=10000            # Polling interval (ms)
AETERNITY_CONFIRMATIONS=1                   # Required confirmations
```

#### Solana Configuration
```bash
SOLANA_CLUSTER=devnet                        # Cluster (devnet/mainnet)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com
SOLANA_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
SOLANA_ORACLE_SEED=trustlens-oracle-sync     # Oracle keypair seed
SOLANA_CONFIRMATIONS=1                      # Required confirmations
```

#### Sync Configuration
```bash
SYNC_ENABLED=true                           # Enable synchronization
SYNC_BATCH_SIZE=10                          # Operations per batch
SYNC_RETRY_ATTEMPTS=3                       # Max retry attempts
SYNC_RETRY_DELAY=5000                       # Retry delay (ms)
SYNC_MAX_CONCURRENT=5                       # Max concurrent operations
```

## 🎯 Usage

### Basic Operation

The service automatically:
1. **Listens** to Aeternity blockchain for escrow events
2. **Maps** Aeternity addresses to Solana addresses
3. **Mints** NFTs on Solana for new escrow deals
4. **Updates** NFT metadata when escrow status changes

### API Endpoints

#### Health Check
```bash
GET /health
```
Returns service health status and component information.

#### Metrics
```bash
GET /metrics
```
Returns service metrics and performance data.

#### Service Info
```bash
GET /
```
Returns basic service information and configuration.

### Example API Responses

#### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": 1703123456789,
  "uptime": 3600000,
  "components": {
    "aeternity": {
      "status": "healthy",
      "lastCheck": 1703123456789,
      "details": {
        "connected": true,
        "lastBlockHeight": 12345,
        "reconnectAttempts": 0
      }
    },
    "solana": {
      "status": "healthy",
      "lastCheck": 1703123456789,
      "details": {
        "rpcUrl": "https://api.devnet.solana.com",
        "cluster": "devnet",
        "oraclePublicKey": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
      }
    }
  },
  "metrics": {
    "totalEvents": 150,
    "successfulOperations": 145,
    "failedOperations": 5,
    "pendingOperations": 2,
    "errorRate": 3.33
  }
}
```

## 🔗 Integration

### With TrustLens AI Service

```javascript
// Update AI verification service to notify sync service
const syncServiceUrl = 'http://localhost:3003';

async function notifySyncService(escrowId, aiResult) {
  await axios.post(`${syncServiceUrl}/ai-verification`, {
    escrowId,
    completionScore: aiResult.completionScore,
    recommendation: aiResult.recommendation,
    timestamp: Date.now()
  });
}
```

### With Frontend

```javascript
// Monitor sync service health in frontend
async function checkSyncHealth() {
  const response = await fetch('http://localhost:3003/health');
  const health = await response.json();
  
  if (health.status === 'healthy') {
    console.log('Cross-chain sync is operational');
  } else {
    console.warn('Cross-chain sync issues detected:', health);
  }
}
```

### Custom Event Handlers

```typescript
import { CrossChainSyncService } from './src/services/CrossChainSyncService';

const syncService = new CrossChainSyncService();

// Listen to custom events
syncService.on('event_processed', (event) => {
  console.log('Event processed:', event.type, event.data);
});

syncService.on('operation_completed', (data) => {
  console.log('Operation completed:', data.escrowId, data.txHash);
});

syncService.on('operation_failed', (error) => {
  console.error('Operation failed:', error);
});
```

## 🐳 Docker Deployment

### Build and Run
```bash
# Build Docker image
docker build -t trustlens-cross-chain-sync .

# Run container
docker run -p 3003:3003 \
  -e SOLANA_PROGRAM_ID=your_program_id \
  -e SOLANA_ORACLE_SEED=your_oracle_seed \
  trustlens-cross-chain-sync
```

### Docker Compose
```bash
# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f cross-chain-sync

# Stop services
docker-compose down
```

## 📊 Monitoring & Logging

### Health Monitoring
The service includes comprehensive health monitoring:
- **Component Health**: Individual health checks for Aeternity, Solana, and sync components
- **Performance Metrics**: Operation counts, error rates, response times
- **Resource Monitoring**: Memory usage, CPU usage, uptime
- **Queue Monitoring**: Operation queue status and processing rates

### Logging
Structured logging with multiple levels:
- **Console Output**: Colorized console logs for development
- **File Logging**: Rotating log files with size limits
- **Error Logging**: Separate error log files
- **Performance Logging**: Operation timing and metrics

### Log Levels
- `error`: Critical errors and failures
- `warn`: Warning messages and degraded states
- `info`: General information and status updates
- `debug`: Detailed debugging information

## 🔐 Security Considerations

### Oracle Security
- **Deterministic Keypairs**: Oracle keypairs generated from seeds
- **Secure Storage**: Environment variable-based configuration
- **Access Control**: Oracle-only operations for minting and updates
- **Key Rotation**: Support for oracle keypair rotation

### Network Security
- **TLS/SSL**: Encrypted connections to blockchain nodes
- **Rate Limiting**: Built-in rate limiting for API requests
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Secure error handling without information leakage

### Operational Security
- **Health Checks**: Regular health monitoring and alerting
- **Graceful Shutdown**: Proper cleanup on service termination
- **Resource Limits**: Memory and CPU usage monitoring
- **Audit Logging**: Comprehensive audit trail for all operations

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Issues
```bash
# Check Aeternity connection
curl -X POST https://testnet.aeternity.io/v3/blocks/top

# Check Solana connection
curl -X POST https://api.devnet.solana.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

#### 2. Oracle Issues
```bash
# Verify oracle balance
solana balance <ORACLE_PUBLIC_KEY> --url devnet

# Check oracle permissions
solana account <ORACLE_PUBLIC_KEY> --url devnet
```

#### 3. Program Issues
```bash
# Verify program deployment
solana program show <PROGRAM_ID> --url devnet

# Check program account
solana account <PROGRAM_ID> --url devnet
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run dev

# View detailed logs
tail -f logs/sync-service.log
```

### Performance Issues
```bash
# Check queue status
curl http://localhost:3003/metrics | jq '.queue'

# Monitor memory usage
docker stats trustlens-cross-chain-sync
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load Balancing**: Multiple service instances behind a load balancer
- **Database Integration**: Persistent storage for escrow mappings
- **Message Queues**: Redis/RabbitMQ for operation queuing
- **Microservices**: Split into specialized services

### Performance Optimization
- **Batch Processing**: Increase batch sizes for higher throughput
- **Connection Pooling**: Optimize blockchain connections
- **Caching**: Cache frequently accessed data
- **Parallel Processing**: Increase concurrent operation limits

### High Availability
- **Health Checks**: Kubernetes/Docker health checks
- **Auto-restart**: Automatic service restart on failure
- **Backup Services**: Redundant service instances
- **Disaster Recovery**: Backup and restore procedures

## 🔮 Future Enhancements

### Planned Features
- **Multi-chain Support**: Support for additional blockchains
- **Wormhole Integration**: Native cross-chain bridge integration
- **Database Persistence**: PostgreSQL/Redis integration
- **Advanced Monitoring**: Prometheus/Grafana integration
- **Webhook Support**: Real-time notifications

### Advanced Features
- **Smart Contract Verification**: On-chain verification of operations
- **Cross-chain Validation**: Verify state consistency across chains
- **Automated Recovery**: Self-healing mechanisms
- **Governance Integration**: DAO-based oracle management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Join our community discussions
- **Discord**: Join our Discord for real-time support

---

Built with ❤️ for the TrustLens ecosystem - bridging Aeternity escrows with Solana NFTs! 🚀
