import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import { Logger } from '../utils/Logger';
import { ConfigManager } from '../config/ConfigManager';
import { EventEmitter } from 'events';

export interface AeternityEvent {
  type: 'FundDeposited' | 'FundReleased' | 'DisputeRaised' | 'FundRefunded';
  contractAddress: string;
  transactionHash: string;
  blockHeight: number;
  timestamp: number;
  data: {
    escrowId?: string;
    amount?: string;
    client?: string;
    freelancer?: string;
    mediator?: string;
    reason?: string;
    disputant?: string;
  };
}

export interface EscrowContract {
  address: string;
  client: string;
  freelancer: string;
  mediator: string;
  amount: string;
  deadline: number;
  disputed: boolean;
}

export class AeternityListener extends EventEmitter {
  private logger: Logger;
  private config: ConfigManager;
  private httpClient: AxiosInstance;
  private wsClient?: WebSocket;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;
  private heartbeatInterval?: NodeJS.Timeout;
  private lastBlockHeight: number = 0;
  private contractAddress?: string;

  constructor() {
    super();
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
    this.contractAddress = this.config.getAeternityConfig().contractAddress;
    
    this.httpClient = axios.create({
      baseURL: this.config.getAeternityConfig().rpcUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupErrorHandling();
  }

  public async start(): Promise<void> {
    try {
      this.logger.info('🔄 Starting Aeternity event listener...');
      
      if (this.contractAddress) {
        this.logger.info(`📋 Monitoring contract: ${this.contractAddress}`);
      } else {
        this.logger.warn('⚠️  No contract address specified, monitoring all escrow contracts');
      }

      await this.connectWebSocket();
      await this.startPolling();
      
      this.logger.info('✅ Aeternity listener started successfully');
    } catch (error) {
      this.logger.logError('Aeternity listener start', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      this.logger.info('🛑 Stopping Aeternity event listener...');
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      
      if (this.wsClient) {
        this.wsClient.close();
        this.wsClient = undefined;
      }
      
      this.isConnected = false;
      this.logger.info('✅ Aeternity listener stopped');
    } catch (error) {
      this.logger.logError('Aeternity listener stop', error);
    }
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.config.getAeternityConfig().wsUrl;
        this.logger.info(`🔌 Connecting to Aeternity WebSocket: ${wsUrl}`);
        
        this.wsClient = new WebSocket(wsUrl);
        
        this.wsClient.on('open', () => {
          this.logger.info('✅ Connected to Aeternity WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        });

        this.wsClient.on('message', (data: WebSocket.Data) => {
          this.handleWebSocketMessage(data);
        });

        this.wsClient.on('error', (error) => {
          this.logger.error('WebSocket error:', error);
          this.isConnected = false;
        });

        this.wsClient.on('close', () => {
          this.logger.warn('WebSocket connection closed');
          this.isConnected = false;
          this.attemptReconnect();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private async startPolling(): Promise<void> {
    const pollingInterval = this.config.getAeternityConfig().pollingInterval;
    
    setInterval(async () => {
      try {
        await this.pollForNewEvents();
      } catch (error) {
        this.logger.logError('Polling error', error);
      }
    }, pollingInterval);
    
    this.logger.info(`🔄 Started polling every ${pollingInterval}ms`);
  }

  private async pollForNewEvents(): Promise<void> {
    try {
      // Get current block height
      const currentBlockHeight = await this.getCurrentBlockHeight();
      
      if (currentBlockHeight > this.lastBlockHeight) {
        this.logger.debug(`📊 New blocks detected: ${this.lastBlockHeight} -> ${currentBlockHeight}`);
        
        // Fetch events from new blocks
        for (let height = this.lastBlockHeight + 1; height <= currentBlockHeight; height++) {
          await this.processBlockEvents(height);
        }
        
        this.lastBlockHeight = currentBlockHeight;
      }
    } catch (error) {
      this.logger.logError('Poll for new events', error);
    }
  }

  private async processBlockEvents(blockHeight: number): Promise<void> {
    try {
      // Get transactions in the block
      const transactions = await this.getBlockTransactions(blockHeight);
      
      for (const tx of transactions) {
        await this.processTransactionEvents(tx);
      }
    } catch (error) {
      this.logger.logError(`Process block events for height ${blockHeight}`, error);
    }
  }

  private async processTransactionEvents(transaction: any): Promise<void> {
    try {
      // Check if transaction involves our escrow contract
      if (this.contractAddress && transaction.contractId !== this.contractAddress) {
        return;
      }

      // Parse transaction events
      if (transaction.logs && transaction.logs.length > 0) {
        for (const log of transaction.logs) {
          const event = this.parseEventLog(log, transaction);
          if (event) {
            this.logger.logAeternityEvent(event.type, event.data);
            this.emit('event', event);
          }
        }
      }
    } catch (error) {
      this.logger.logError('Process transaction events', error, { transactionHash: transaction.hash });
    }
  }

  private parseEventLog(log: any, transaction: any): AeternityEvent | null {
    try {
      // Parse different event types based on log structure
      if (log.event === 'FundDeposited') {
        return {
          type: 'FundDeposited',
          contractAddress: transaction.contractId,
          transactionHash: transaction.hash,
          blockHeight: transaction.blockHeight,
          timestamp: transaction.timestamp,
          data: {
            amount: log.data.amount,
            client: log.data.client,
          },
        };
      } else if (log.event === 'FundReleased') {
        return {
          type: 'FundReleased',
          contractAddress: transaction.contractId,
          transactionHash: transaction.hash,
          blockHeight: transaction.blockHeight,
          timestamp: transaction.timestamp,
          data: {
            amount: log.data.amount,
            freelancer: log.data.freelancer,
          },
        };
      } else if (log.event === 'DisputeRaised') {
        return {
          type: 'DisputeRaised',
          contractAddress: transaction.contractId,
          transactionHash: transaction.hash,
          blockHeight: transaction.blockHeight,
          timestamp: transaction.timestamp,
          data: {
            reason: log.data.reason,
            disputant: log.data.disputant,
            mediator: log.data.mediator,
          },
        };
      } else if (log.event === 'FundRefunded') {
        return {
          type: 'FundRefunded',
          contractAddress: transaction.contractId,
          transactionHash: transaction.hash,
          blockHeight: transaction.blockHeight,
          timestamp: transaction.timestamp,
          data: {
            amount: log.data.amount,
            client: log.data.client,
          },
        };
      }
      
      return null;
    } catch (error) {
      this.logger.logError('Parse event log', error, { log, transactionHash: transaction.hash });
      return null;
    }
  }

  private handleWebSocketMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      
      // Handle different WebSocket message types
      if (message.type === 'event' && message.data) {
        const event = this.parseEventLog(message.data, message.transaction);
        if (event) {
          this.logger.logAeternityEvent(event.type, event.data);
          this.emit('event', event);
        }
      }
    } catch (error) {
      this.logger.logError('Handle WebSocket message', error, { data: data.toString() });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
        this.wsClient.ping();
      } else {
        this.isConnected = false;
        this.attemptReconnect();
      }
    }, 30000); // 30 seconds
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.logger.info(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(async () => {
      try {
        await this.connectWebSocket();
      } catch (error) {
        this.logger.logError('Reconnection attempt', error);
        this.attemptReconnect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private async getCurrentBlockHeight(): Promise<number> {
    try {
      const response = await this.httpClient.get('/v3/blocks/top');
      return response.data.height;
    } catch (error) {
      this.logger.logError('Get current block height', error);
      return 0;
    }
  }

  private async getBlockTransactions(blockHeight: number): Promise<any[]> {
    try {
      const response = await this.httpClient.get(`/v3/blocks/${blockHeight}/transactions`);
      return response.data.transactions || [];
    } catch (error) {
      this.logger.logError(`Get block transactions for height ${blockHeight}`, error);
      return [];
    }
  }

  public async getEscrowContract(address: string): Promise<EscrowContract | null> {
    try {
      const response = await this.httpClient.get(`/v3/contracts/${address}`);
      const contract = response.data;
      
      // Parse contract state to extract escrow data
      // This would depend on the specific contract structure
      return {
        address,
        client: contract.state.client || '',
        freelancer: contract.state.freelancer || '',
        mediator: contract.state.mediator || '',
        amount: contract.state.amount || '0',
        deadline: contract.state.deadline || 0,
        disputed: contract.state.disputed || false,
      };
    } catch (error) {
      this.logger.logError(`Get escrow contract ${address}`, error);
      return null;
    }
  }

  public isHealthy(): boolean {
    return this.isConnected && this.wsClient?.readyState === WebSocket.OPEN;
  }

  public getConnectionInfo(): any {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastBlockHeight: this.lastBlockHeight,
      contractAddress: this.contractAddress,
    };
  }

  private setupErrorHandling(): void {
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error('HTTP request failed:', error.message);
        return Promise.reject(error);
      }
    );
  }
}
