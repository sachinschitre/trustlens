/**
 * TrustLens Contract Configuration
 * Contains all contract addresses and network settings
 */

// Network Configuration
export const NETWORK_CONFIG = {
  testnet: {
    name: 'testnet',
    nodeUrl: 'https://testnet.aeternity.io',
    compilerUrl: 'https://compiler.aepps.com',
    internalUrl: 'https://sdk-testnet.aepps.com',
    explorerUrl: 'https://aescan.io',
    chainId: 'ae_uat'
  },
  mainnet: {
    name: 'mainnet',
    nodeUrl: 'https://mainnet.aeternity.io',
    compilerUrl: 'https://compiler.aepps.com',
    internalUrl: 'https://sdk-mainnet.aepps.com',
    explorerUrl: 'https://aescan.io',
    chainId: 'ae_mainnet'
  }
};

// Contract Configuration
export const CONTRACT_CONFIG = {
  // Deployed TrustLens Escrow Contract
  escrow: {
    address: 'ct_mgcu3hf44v523o840mx',
    transactionHash: 'th_mgcu3hf46bhx96u8b0h',
    deployerAddress: 'ak_mockAddress123456789',
    deployedAt: '2025-10-04T22:17:52.624Z',
    network: 'testnet'
  },
  
  // Contract ABI (for reference)
  abi: {
    functions: [
      'deposit()',
      'release()', 
      'dispute(string)',
      'refund()',
      'get_project_details()'
    ],
    events: [
      'FundDeposited',
      'FundReleased', 
      'DisputeRaised',
      'FundRefunded'
    ]
  }
};

// Default Configuration
export const DEFAULT_CONFIG = {
  network: 'testnet',
  contractAddress: CONTRACT_CONFIG.escrow.address,
  gasLimit: 200000,
  gasPrice: 1000000000,
  timeout: 30000
};

// Environment-specific overrides
const ENV_CONFIG = {
  development: {
    useMockTransactions: true,
    mockDelay: 1000,
    debugMode: true
  },
  production: {
    useMockTransactions: false,
    mockDelay: 0,
    debugMode: false
  }
};

// Get current environment
const currentEnv = import.meta.env.MODE || 'development';

// Export combined configuration
export const CONFIG = {
  ...DEFAULT_CONFIG,
  network: NETWORK_CONFIG[DEFAULT_CONFIG.network],
  contract: CONTRACT_CONFIG.escrow,
  environment: ENV_CONFIG[currentEnv],
  
  // Helper functions
  getExplorerUrl: (type = 'tx', hash) => {
    const baseUrl = NETWORK_CONFIG[DEFAULT_CONFIG.network].explorerUrl;
    return `${baseUrl}/#/${type}/${hash}`;
  },
  
  getNetworkInfo: () => ({
    name: DEFAULT_CONFIG.network,
    ...NETWORK_CONFIG[DEFAULT_CONFIG.network]
  }),
  
  isTestnet: () => DEFAULT_CONFIG.network === 'testnet',
  isMainnet: () => DEFAULT_CONFIG.network === 'mainnet'
};

// Export for easy access
export default CONFIG;
