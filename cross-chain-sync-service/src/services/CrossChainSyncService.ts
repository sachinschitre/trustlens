import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { ConfigManager } from '../config/ConfigManager';
import { AeternityListener, AeternityEvent } from './AeternityListener';
import { SolanaBridge } from './SolanaBridge';
import { PublicKey } from '@solana/web3.js';

export interface SyncStats {
  totalEvents: number;
  successfulOperations: number;
  failedOperations: number;
  pendingOperations: number;
  lastSyncTime: number;
  uptime: number;
}

export interface EscrowMapping {
  aeternityEscrowId: string;
  solanaNftAddress: string;
  clientSolanaWallet: string;
  freelancerSolanaWallet: string;
  status: 'minting' | 'minted' | 'updating' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
}

export class CrossChainSyncService extends EventEmitter {
  private logger: Logger;
  private config: ConfigManager;
  private aeternityListener: AeternityListener;
  private solanaBridge: SolanaBridge;
  private isRunning: boolean = false;
  private startTime: number = 0;
  private stats: SyncStats;
  private escrowMappings: Map<string, EscrowMapping> = new Map();
  private addressMappingCache: Map<string, string> = new Map();

  constructor() {
    super();
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
    
    this.aeternityListener = new AeternityListener();
    this.solanaBridge = new SolanaBridge();
    
    this.stats = {
      totalEvents: 0,
      successfulOperations: 0,
      failedOperations: 0,
      pendingOperations: 0,
      lastSyncTime: 0,
      uptime: 0,
    };

    this.setupEventHandlers();
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('🔧 Initializing cross-chain sync service...');

      // Initialize Solana bridge
      await this.solanaBridge.initialize();
      this.logger.info('✅ Solana bridge initialized');

      // Initialize Aeternity listener
      await this.aeternityListener.start();
      this.logger.info('✅ Aeternity listener initialized');

      // Load existing mappings (if any)
      await this.loadEscrowMappings();
      this.logger.info('✅ Escrow mappings loaded');

      this.logger.info('✅ Cross-chain sync service initialized');
    } catch (error) {
      this.logger.logError('Cross-chain sync service initialization', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      if (this.isRunning) {
        this.logger.warn('⚠️  Sync service is already running');
        return;
      }

      this.logger.info('🚀 Starting cross-chain synchronization...');
      this.isRunning = true;
      this.startTime = Date.now();

      // Start periodic stats update
      this.startStatsUpdate();

      // Start periodic health checks
      this.startHealthChecks();

      this.logger.info('✅ Cross-chain synchronization started');
      this.emit('started');
    } catch (error) {
      this.logger.logError('Start cross-chain sync', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      if (!this.isRunning) {
        this.logger.warn('⚠️  Sync service is not running');
        return;
      }

      this.logger.info('🛑 Stopping cross-chain synchronization...');
      this.isRunning = false;

      // Stop Aeternity listener
      await this.aeternityListener.stop();
      this.logger.info('✅ Aeternity listener stopped');

      // Save mappings
      await this.saveEscrowMappings();
      this.logger.info('✅ Escrow mappings saved');

      this.logger.info('✅ Cross-chain synchronization stopped');
      this.emit('stopped');
    } catch (error) {
      this.logger.logError('Stop cross-chain sync', error);
    }
  }

  private setupEventHandlers(): void {
    // Handle Aeternity events
    this.aeternityListener.on('event', async (event: AeternityEvent) => {
      await this.handleAeternityEvent(event);
    });

    // Handle Solana bridge events
    this.solanaBridge.on('operation_completed', (data: any) => {
      this.stats.successfulOperations++;
      this.updateEscrowMappingStatus(data.escrowId, 'completed');
      this.logger.logSyncOperation('Operation Completed', data.escrowId, 'success', data);
    });

    this.solanaBridge.on('operation_failed', (data: any) => {
      this.stats.failedOperations++;
      this.updateEscrowMappingStatus(data.escrowId, 'failed');
      this.logger.logError('Solana operation failed', data.error, { escrowId: data.escrowId });
    });
  }

  private async handleAeternityEvent(event: AeternityEvent): Promise<void> {
    try {
      this.stats.totalEvents++;
      this.stats.lastSyncTime = Date.now();

      this.logger.logAeternityEvent(event.type, event.data);

      switch (event.type) {
        case 'FundDeposited':
          await this.handleFundDeposited(event);
          break;
        case 'FundReleased':
          await this.handleFundReleased(event);
          break;
        case 'DisputeRaised':
          await this.handleDisputeRaised(event);
          break;
        case 'FundRefunded':
          await this.handleFundRefunded(event);
          break;
        default:
          this.logger.warn(`Unknown event type: ${event.type}`);
      }

      this.emit('event_processed', event);
    } catch (error) {
      this.logger.logError(`Handle Aeternity event ${event.type}`, error, { 
        escrowId: event.data.escrowId,
        txHash: event.transactionHash 
      });
    }
  }

  private async handleFundDeposited(event: AeternityEvent): Promise<void> {
    try {
      // Extract escrow ID from contract address or transaction data
      const escrowId = this.extractEscrowId(event);
      
      // Check if we already have a mapping for this escrow
      if (this.escrowMappings.has(escrowId)) {
        this.logger.debug(`Escrow ${escrowId} already exists, skipping mint`);
        return;
      }

      // Get escrow contract details
      const escrowContract = await this.aeternityListener.getEscrowContract(event.contractAddress);
      if (!escrowContract) {
        throw new Error(`Failed to get escrow contract details for ${event.contractAddress}`);
      }

      // Map Aeternity addresses to Solana addresses
      const clientSolanaWallet = await this.mapToSolanaAddress(escrowContract.client);
      const freelancerSolanaWallet = await this.mapToSolanaAddress(escrowContract.freelancer);

      // Create escrow mapping
      const mapping: EscrowMapping = {
        aeternityEscrowId: escrowId,
        solanaNftAddress: '', // Will be set after minting
        clientSolanaWallet: clientSolanaWallet.toString(),
        freelancerSolanaWallet: freelancerSolanaWallet.toString(),
        status: 'minting',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.escrowMappings.set(escrowId, mapping);
      this.updateEscrowMappingStatus(escrowId, 'minting');

      // Mint NFT on Solana
      this.logger.logSyncOperation('Mint NFT', escrowId, 'initiated', {
        client: clientSolanaWallet.toString(),
        freelancer: freelancerSolanaWallet.toString(),
        amount: escrowContract.amount,
      });

      const txHash = await this.solanaBridge.mintEscrowNft(
        escrowId,
        clientSolanaWallet,
        freelancerSolanaWallet,
        parseInt(escrowContract.amount),
        `Escrow deal #${escrowId}` // This would be more descriptive in a real implementation
      );

      // Update mapping with NFT address
      mapping.solanaNftAddress = txHash; // In a real implementation, this would be the NFT mint address
      mapping.status = 'minted';
      mapping.updatedAt = Date.now();

      this.logger.logSyncOperation('Mint NFT', escrowId, 'completed', { txHash });
      this.updateEscrowMappingStatus(escrowId, 'minted');

    } catch (error) {
      this.logger.logError('Handle fund deposited', error, { 
        escrowId: this.extractEscrowId(event),
        contractAddress: event.contractAddress 
      });
    }
  }

  private async handleFundReleased(event: AeternityEvent): Promise<void> {
    try {
      const escrowId = this.extractEscrowId(event);
      
      if (!this.escrowMappings.has(escrowId)) {
        this.logger.warn(`No mapping found for escrow ${escrowId}, skipping status update`);
        return;
      }

      this.updateEscrowMappingStatus(escrowId, 'updating');

      // Update NFT status to released
      const txHash = await this.solanaBridge.updateEscrowStatus(escrowId, 'released');
      
      this.logger.logSyncOperation('Update Status', escrowId, 'released', { txHash });
      this.updateEscrowMappingStatus(escrowId, 'completed');

    } catch (error) {
      this.logger.logError('Handle fund released', error, { 
        escrowId: this.extractEscrowId(event),
        contractAddress: event.contractAddress 
      });
    }
  }

  private async handleDisputeRaised(event: AeternityEvent): Promise<void> {
    try {
      const escrowId = this.extractEscrowId(event);
      
      if (!this.escrowMappings.has(escrowId)) {
        this.logger.warn(`No mapping found for escrow ${escrowId}, skipping status update`);
        return;
      }

      this.updateEscrowMappingStatus(escrowId, 'updating');

      // Update NFT status to disputed
      const txHash = await this.solanaBridge.updateEscrowStatus(escrowId, 'disputed');
      
      this.logger.logSyncOperation('Update Status', escrowId, 'disputed', { txHash });
      this.updateEscrowMappingStatus(escrowId, 'completed');

    } catch (error) {
      this.logger.logError('Handle dispute raised', error, { 
        escrowId: this.extractEscrowId(event),
        contractAddress: event.contractAddress 
      });
    }
  }

  private async handleFundRefunded(event: AeternityEvent): Promise<void> {
    try {
      const escrowId = this.extractEscrowId(event);
      
      if (!this.escrowMappings.has(escrowId)) {
        this.logger.warn(`No mapping found for escrow ${escrowId}, skipping status update`);
        return;
      }

      this.updateEscrowMappingStatus(escrowId, 'updating');

      // Update NFT status to disputed (refunded funds are considered disputed)
      const txHash = await this.solanaBridge.updateEscrowStatus(escrowId, 'disputed');
      
      this.logger.logSyncOperation('Update Status', escrowId, 'refunded', { txHash });
      this.updateEscrowMappingStatus(escrowId, 'completed');

    } catch (error) {
      this.logger.logError('Handle fund refunded', error, { 
        escrowId: this.extractEscrowId(event),
        contractAddress: event.contractAddress 
      });
    }
  }

  private extractEscrowId(event: AeternityEvent): string {
    // Extract escrow ID from the event data
    // This would depend on how the escrow ID is stored in the Aeternity contract
    if (event.data.escrowId) {
      return event.data.escrowId;
    }
    
    // Fallback: use contract address as escrow ID
    return event.contractAddress;
  }

  private async mapToSolanaAddress(aeternityAddress: string): Promise<PublicKey> {
    // Check cache first
    if (this.addressMappingCache.has(aeternityAddress)) {
      return new PublicKey(this.addressMappingCache.get(aeternityAddress)!);
    }

    // In a real implementation, this would query a mapping service
    // For now, we'll generate a deterministic Solana address
    const seed = `solana_${aeternityAddress}`;
    const seedBuffer = Buffer.from(seed, 'utf8');
    const seedHash = require('crypto').createHash('sha256').update(seedBuffer).digest();
    const keypair = require('@solana/web3.js').Keypair.fromSeed(seedHash.slice(0, 32));
    
    const solanaAddress = keypair.publicKey.toString();
    this.addressMappingCache.set(aeternityAddress, solanaAddress);
    
    return keypair.publicKey;
  }

  private updateEscrowMappingStatus(escrowId: string, status: EscrowMapping['status']): void {
    const mapping = this.escrowMappings.get(escrowId);
    if (mapping) {
      mapping.status = status;
      mapping.updatedAt = Date.now();
      this.escrowMappings.set(escrowId, mapping);
    }
  }

  private async loadEscrowMappings(): Promise<void> {
    try {
      // In a real implementation, this would load from a database
      // For now, we'll use an in-memory Map
      this.logger.info('📋 Loaded escrow mappings from memory');
    } catch (error) {
      this.logger.logError('Load escrow mappings', error);
    }
  }

  private async saveEscrowMappings(): Promise<void> {
    try {
      // In a real implementation, this would save to a database
      this.logger.info(`💾 Saved ${this.escrowMappings.size} escrow mappings`);
    } catch (error) {
      this.logger.logError('Save escrow mappings', error);
    }
  }

  private startStatsUpdate(): void {
    setInterval(() => {
      this.stats.uptime = Date.now() - this.startTime;
      this.stats.pendingOperations = this.solanaBridge.getQueueStatus().pendingOperations;
    }, 10000); // Update every 10 seconds
  }

  private startHealthChecks(): void {
    setInterval(async () => {
      try {
        const aeternityHealthy = this.aeternityListener.isHealthy();
        const solanaHealthy = this.solanaBridge.isHealthy();
        
        if (!aeternityHealthy || !solanaHealthy) {
          this.logger.warn('⚠️  Health check failed', {
            aeternity: aeternityHealthy,
            solana: solanaHealthy,
          });
        }
      } catch (error) {
        this.logger.logError('Health check', error);
      }
    }, 30000); // Check every 30 seconds
  }

  public getStats(): SyncStats {
    return { ...this.stats };
  }

  public getEscrowMappings(): EscrowMapping[] {
    return Array.from(this.escrowMappings.values());
  }

  public getEscrowMapping(escrowId: string): EscrowMapping | undefined {
    return this.escrowMappings.get(escrowId);
  }

  public getServiceStatus(): any {
    return {
      isRunning: this.isRunning,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      aeternity: this.aeternityListener.getConnectionInfo(),
      solana: this.solanaBridge.getConnectionInfo(),
      queue: this.solanaBridge.getQueueStatus(),
      stats: this.getStats(),
    };
  }

  public isHealthy(): boolean {
    return this.isRunning && 
           this.aeternityListener.isHealthy() && 
           this.solanaBridge.isHealthy();
  }
}
