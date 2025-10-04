/**
 * Superhero Wallet Service
 * Handles integration with Superhero Wallet browser extension
 * Provides detection, connection, and transaction signing capabilities
 */

class SuperheroWalletService {
  constructor() {
    this.isAvailable = false;
    this.isConnected = false;
    this.account = null;
    this.wallet = null;
    this.network = 'testnet'; // Default to testnet
    this.nodeUrl = 'https://testnet.aeternity.io';
    this.compilerUrl = 'https://compiler.aepps.com';
    
    this.checkAvailability();
  }

  /**
   * Check if Superhero Wallet is available in the browser
   */
  checkAvailability() {
    this.isAvailable = typeof window !== 'undefined' && 
                      window.superhero && 
                      window.superhero.isConnected;
    
    if (this.isAvailable) {
      console.log('Superhero Wallet detected');
      this.setupEventListeners();
    } else {
      console.log('Superhero Wallet not detected');
    }
  }

  /**
   * Setup event listeners for wallet state changes
   */
  setupEventListeners() {
    if (!this.isAvailable) return;

    // Listen for account changes
    window.addEventListener('message', (event) => {
      if (event.data.type === 'SUPERHERO_ACCOUNT_CHANGED') {
        this.handleAccountChange(event.data.account);
      }
    });
  }

  /**
   * Handle account change events
   */
  handleAccountChange(newAccount) {
    this.account = newAccount;
    this.isConnected = !!newAccount;
    console.log('Account changed:', newAccount);
  }

  /**
   * Connect to Superhero Wallet
   */
  async connect() {
    if (!this.isAvailable) {
      throw new Error('Superhero Wallet is not installed. Please install it from https://superhero.com/');
    }

    try {
      // Request connection to Superhero Wallet
      const response = await window.superhero.connect();
      
      if (response.success && response.account) {
        this.account = response.account;
        this.isConnected = true;
        this.wallet = window.superhero;
        
        console.log('Connected to Superhero Wallet:', this.account);
        return {
          success: true,
          account: this.account,
          network: this.network
        };
      } else {
        throw new Error(response.error || 'Failed to connect to Superhero Wallet');
      }
    } catch (error) {
      console.error('Connection error:', error);
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  /**
   * Disconnect from Superhero Wallet
   */
  async disconnect() {
    if (this.isConnected && this.wallet) {
      try {
        await this.wallet.disconnect();
        this.account = null;
        this.isConnected = false;
        this.wallet = null;
        console.log('Disconnected from Superhero Wallet');
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  }

  /**
   * Get current account balance
   */
  async getBalance() {
    if (!this.isConnected || !this.account) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.wallet.getBalance(this.account.address);
      return balance;
    } catch (error) {
      console.error('Balance fetch error:', error);
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }
  }

  /**
   * Sign and send a transaction
   */
  async signTransaction(tx) {
    if (!this.isConnected || !this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedTx = await this.wallet.signTransaction(tx);
      return signedTx;
    } catch (error) {
      console.error('Transaction signing error:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message) {
    if (!this.isConnected || !this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.wallet.signMessage(message, this.account.address);
      return signature;
    } catch (error) {
      console.error('Message signing error:', error);
      throw new Error(`Message signing failed: ${error.message}`);
    }
  }

  /**
   * Deploy a contract
   */
  async deployContract(contractSource, initParams = []) {
    if (!this.isConnected || !this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const deployment = await this.wallet.deployContract({
        source: contractSource,
        initParams: initParams
      });
      return deployment;
    } catch (error) {
      console.error('Contract deployment error:', error);
      throw new Error(`Contract deployment failed: ${error.message}`);
    }
  }

  /**
   * Call a contract function
   */
  async callContract(contractAddress, functionName, params = [], options = {}) {
    if (!this.isConnected || !this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await this.wallet.callContract({
        contractAddress,
        functionName,
        params,
        options
      });
      return result;
    } catch (error) {
      console.error('Contract call error:', error);
      throw new Error(`Contract call failed: ${error.message}`);
    }
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      network: this.network,
      nodeUrl: this.nodeUrl,
      compilerUrl: this.compilerUrl,
      isTestnet: this.network === 'testnet'
    };
  }

  /**
   * Get wallet status
   */
  getStatus() {
    return {
      isAvailable: this.isAvailable,
      isConnected: this.isConnected,
      account: this.account,
      network: this.network
    };
  }

  /**
   * Format address for display
   */
  formatAddress(address, length = 6) {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  }

  /**
   * Convert aettos to AE
   */
  aettosToAE(aettos) {
    return (aettos / Math.pow(10, 18)).toFixed(4);
  }

  /**
   * Convert AE to aettos
   */
  aeToAettos(ae) {
    return Math.floor(ae * Math.pow(10, 18));
  }
}

// Create a singleton instance
const superheroWalletService = new SuperheroWalletService();

export default superheroWalletService;
