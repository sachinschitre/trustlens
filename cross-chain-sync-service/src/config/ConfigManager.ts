import dotenv from 'dotenv';
import { Logger } from '../utils/Logger';

export interface AeternityConfig {
  network: string;
  rpcUrl: string;
  wsUrl: string;
  contractAddress?: string;
  pollingInterval: number;
  confirmations: number;
}

export interface SolanaConfig {
  cluster: string;
  rpcUrl: string;
  wsUrl: string;
  programId: string;
  oracleSeed: string;
  confirmations: number;
}

export interface ServerConfig {
  port: number;
  host: string;
  corsOrigins: string[];
}

export interface SyncConfig {
  enabled: boolean;
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
  maxConcurrentOperations: number;
}

export interface AppConfig {
  aeternity: AeternityConfig;
  solana: SolanaConfig;
  server: ServerConfig;
  sync: SyncConfig;
  logging: {
    level: string;
    file: string;
    console: boolean;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;
  private logger: Logger;

  private constructor() {
    dotenv.config();
    this.logger = Logger.getInstance();
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    return {
      aeternity: {
        network: process.env.AETERNITY_NETWORK || 'testnet',
        rpcUrl: process.env.AETERNITY_RPC_URL || 'https://testnet.aeternity.io',
        wsUrl: process.env.AETERNITY_WS_URL || 'wss://testnet.aeternity.io/websocket',
        contractAddress: process.env.AETERNITY_CONTRACT_ADDRESS,
        pollingInterval: parseInt(process.env.AETERNITY_POLLING_INTERVAL || '10000'), // 10 seconds
        confirmations: parseInt(process.env.AETERNITY_CONFIRMATIONS || '1'),
      },
      solana: {
        cluster: process.env.SOLANA_CLUSTER || 'devnet',
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        wsUrl: process.env.SOLANA_WS_URL || 'wss://api.devnet.solana.com',
        programId: process.env.SOLANA_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
        oracleSeed: process.env.SOLANA_ORACLE_SEED || 'trustlens-oracle-sync',
        confirmations: parseInt(process.env.SOLANA_CONFIRMATIONS || '1'),
      },
      server: {
        port: parseInt(process.env.PORT || '3003'),
        host: process.env.HOST || 'localhost',
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3002'],
      },
      sync: {
        enabled: process.env.SYNC_ENABLED !== 'false',
        batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '10'),
        retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3'),
        retryDelay: parseInt(process.env.SYNC_RETRY_DELAY || '5000'), // 5 seconds
        maxConcurrentOperations: parseInt(process.env.SYNC_MAX_CONCURRENT || '5'),
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/sync-service.log',
        console: process.env.LOG_CONSOLE !== 'false',
      },
    };
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public getAeternityConfig(): AeternityConfig {
    return this.config.aeternity;
  }

  public getSolanaConfig(): SolanaConfig {
    return this.config.solana;
  }

  public getServerConfig(): ServerConfig {
    return this.config.server;
  }

  public getSyncConfig(): SyncConfig {
    return this.config.sync;
  }

  public validateConfig(): void {
    const errors: string[] = [];

    // Validate Aeternity config
    if (!this.config.aeternity.rpcUrl) {
      errors.push('AETERNITY_RPC_URL is required');
    }
    if (!this.config.aeternity.wsUrl) {
      errors.push('AETERNITY_WS_URL is required');
    }
    if (this.config.aeternity.pollingInterval < 1000) {
      errors.push('AETERNITY_POLLING_INTERVAL must be at least 1000ms');
    }

    // Validate Solana config
    if (!this.config.solana.rpcUrl) {
      errors.push('SOLANA_RPC_URL is required');
    }
    if (!this.config.solana.programId) {
      errors.push('SOLANA_PROGRAM_ID is required');
    }
    if (!this.config.solana.oracleSeed) {
      errors.push('SOLANA_ORACLE_SEED is required');
    }

    // Validate server config
    if (this.config.server.port < 1 || this.config.server.port > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }

    // Validate sync config
    if (this.config.sync.batchSize < 1) {
      errors.push('SYNC_BATCH_SIZE must be at least 1');
    }
    if (this.config.sync.retryAttempts < 0) {
      errors.push('SYNC_RETRY_ATTEMPTS must be non-negative');
    }
    if (this.config.sync.maxConcurrentOperations < 1) {
      errors.push('SYNC_MAX_CONCURRENT must be at least 1');
    }

    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    this.logger.info('Configuration validation passed');
  }

  public reloadConfig(): void {
    this.logger.info('Reloading configuration...');
    dotenv.config();
    this.config = this.loadConfig();
    this.validateConfig();
    this.logger.info('Configuration reloaded successfully');
  }

  public getEnvVar(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue;
  }

  public isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}
