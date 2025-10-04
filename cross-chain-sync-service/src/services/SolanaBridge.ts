import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Logger } from '../utils/Logger';
import { ConfigManager } from '../config/ConfigManager';
import { AeternityEvent } from './AeternityListener';
import { findProgramAddressSync } from '@coral-xyz/anchor/dist/cjs/utils/pubkey';
import bs58 from 'bs58';

// Import the generated program types (this would be generated from the Anchor build)
interface TrustlensNftReceipt {
  programId: PublicKey;
}

export interface SolanaOperation {
  type: 'mint' | 'update_status' | 'transfer';
  escrowId: string;
  data: any;
  retryCount?: number;
}

export interface MintNftData {
  clientWallet: PublicKey;
  freelancerWallet: PublicKey;
  amount: number;
  projectDescription: string;
}

export interface UpdateStatusData {
  status: 'active' | 'released' | 'disputed';
  completionScore?: number;
}

export class SolanaBridge {
  private logger: Logger;
  private config: ConfigManager;
  private connection: Connection;
  private program: Program<TrustlensNftReceipt>;
  private oracle: Keypair;
  private pendingOperations: Map<string, SolanaOperation> = new Map();
  private operationQueue: SolanaOperation[] = [];
  private isProcessing: boolean = false;
  private maxConcurrentOperations: number;

  constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
    this.maxConcurrentOperations = this.config.getSyncConfig().maxConcurrentOperations;
    
    // Initialize Solana connection
    const solanaConfig = this.config.getSolanaConfig();
    this.connection = new Connection(solanaConfig.rpcUrl, 'confirmed');
    
    // Create oracle keypair from seed
    this.oracle = this.createOracleFromSeed(solanaConfig.oracleSeed);
    
    // Initialize program (this would be loaded from the deployed program)
    this.program = this.initializeProgram();
    
    this.logger.info(`🔑 Oracle Public Key: ${this.oracle.publicKey.toString()}`);
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('🔧 Initializing Solana bridge...');
      
      // Verify connection
      const version = await this.connection.getVersion();
      this.logger.info(`✅ Connected to Solana ${version['solana-core']}`);
      
      // Verify oracle has sufficient balance
      const balance = await this.connection.getBalance(this.oracle.publicKey);
      this.logger.info(`💰 Oracle balance: ${balance / 1e9} SOL`);
      
      if (balance < 0.1e9) { // Less than 0.1 SOL
        this.logger.warn('⚠️  Low oracle balance, consider funding');
      }
      
      // Start processing queue
      this.startQueueProcessor();
      
      this.logger.info('✅ Solana bridge initialized');
    } catch (error) {
      this.logger.logError('Solana bridge initialization', error);
      throw error;
    }
  }

  public async mintEscrowNft(
    escrowId: string,
    clientWallet: PublicKey,
    freelancerWallet: PublicKey,
    amount: number,
    projectDescription: string
  ): Promise<string> {
    const operation: SolanaOperation = {
      type: 'mint',
      escrowId,
      data: {
        clientWallet,
        freelancerWallet,
        amount,
        projectDescription,
      },
    };

    return this.queueOperation(operation);
  }

  public async updateEscrowStatus(
    escrowId: string,
    status: 'active' | 'released' | 'disputed',
    completionScore?: number
  ): Promise<string> {
    const operation: SolanaOperation = {
      type: 'update_status',
      escrowId,
      data: {
        status,
        completionScore,
      },
    };

    return this.queueOperation(operation);
  }

  public async transferNft(
    escrowId: string,
    toWallet: PublicKey
  ): Promise<string> {
    const operation: SolanaOperation = {
      type: 'transfer',
      escrowId,
      data: {
        toWallet,
      },
    };

    return this.queueOperation(operation);
  }

  private async queueOperation(operation: SolanaOperation): Promise<string> {
    this.logger.logSyncOperation('Queue Operation', operation.escrowId, 'queued', { type: operation.type });
    
    this.operationQueue.push(operation);
    this.pendingOperations.set(operation.escrowId, operation);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      setImmediate(() => this.processQueue());
    }
    
    // Return a promise that resolves when the operation completes
    return new Promise((resolve, reject) => {
      const checkCompletion = () => {
        const pendingOp = this.pendingOperations.get(operation.escrowId);
        if (!pendingOp) {
          resolve('completed');
        } else if (pendingOp.retryCount && pendingOp.retryCount > 3) {
          reject(new Error('Operation failed after maximum retries'));
        } else {
          setTimeout(checkCompletion, 1000);
        }
      };
      checkCompletion();
    });
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (!this.isProcessing && this.operationQueue.length > 0) {
        this.processQueue();
      }
    }, 1000); // Check every second
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      const batchSize = Math.min(
        this.config.getSyncConfig().batchSize,
        this.maxConcurrentOperations
      );
      
      const operations = this.operationQueue.splice(0, batchSize);
      
      if (operations.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      this.logger.info(`🔄 Processing ${operations.length} Solana operations`);
      
      // Process operations concurrently
      const promises = operations.map(op => this.processOperation(op));
      await Promise.allSettled(promises);
      
    } catch (error) {
      this.logger.logError('Process queue', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processOperation(operation: SolanaOperation): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.logger.logSyncOperation('Process Operation', operation.escrowId, 'processing', { type: operation.type });
      
      let txHash: string;
      
      switch (operation.type) {
        case 'mint':
          txHash = await this.executeMintOperation(operation);
          break;
        case 'update_status':
          txHash = await this.executeUpdateStatusOperation(operation);
          break;
        case 'transfer':
          txHash = await this.executeTransferOperation(operation);
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }
      
      const duration = Date.now() - startTime;
      this.logger.logPerformance(`Solana ${operation.type}`, duration, { escrowId: operation.escrowId, txHash });
      
      // Remove from pending operations
      this.pendingOperations.delete(operation.escrowId);
      
      this.logger.logSyncOperation('Process Operation', operation.escrowId, 'completed', { 
        type: operation.type, 
        txHash,
        duration: `${duration}ms`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logError(`Process operation ${operation.type}`, error, { 
        escrowId: operation.escrowId,
        duration: `${duration}ms`
      });
      
      // Handle retry logic
      await this.handleOperationRetry(operation);
    }
  }

  private async executeMintOperation(operation: SolanaOperation): Promise<string> {
    const { clientWallet, freelancerWallet, amount, projectDescription } = operation.data as MintNftData;
    
    // Calculate PDAs
    const [masterPda] = findProgramAddressSync([Buffer.from("master")], this.program.programId);
    const [escrowNftPda] = findProgramAddressSync(
      [Buffer.from("escrow_nft"), Buffer.from(operation.escrowId)],
      this.program.programId
    );
    const [mintPda] = findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(operation.escrowId)],
      this.program.programId
    );

    // Get metadata account
    const metadataAccount = findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(), // Token Metadata Program ID
        mintPda.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    )[0];

    // Create mint instruction
    const mintInstruction = await this.program.methods
      .mintEscrowNft(
        operation.escrowId,
        clientWallet,
        freelancerWallet,
        new (await import('@coral-xyz/anchor')).BN(amount),
        projectDescription
      )
      .accounts({
        master: masterPda,
        escrowNft: escrowNftPda,
        mintAccount: mintPda,
        metadataAccount: metadataAccount,
        oracle: this.oracle.publicKey,
        payer: this.oracle.publicKey,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
        systemProgram: new PublicKey("11111111111111111111111111111111"),
        rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
      })
      .instruction();

    // Create and send transaction
    const transaction = new Transaction().add(mintInstruction);
    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.oracle],
      { commitment: 'confirmed' }
    );

    this.logger.logSolanaTransaction('mint_nft', txHash, { escrowId: operation.escrowId });
    return txHash;
  }

  private async executeUpdateStatusOperation(operation: SolanaOperation): Promise<string> {
    const { status, completionScore } = operation.data as UpdateStatusData;
    
    // Calculate PDAs
    const [masterPda] = findProgramAddressSync([Buffer.from("master")], this.program.programId);
    const [escrowNftPda] = findProgramAddressSync(
      [Buffer.from("escrow_nft"), Buffer.from(operation.escrowId)],
      this.program.programId
    );

    // Get metadata account
    const [mintPda] = findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(operation.escrowId)],
      this.program.programId
    );
    const metadataAccount = findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mintPda.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    )[0];

    // Map status to Anchor enum
    const anchorStatus = status === 'released' ? { released: {} } : 
                        status === 'disputed' ? { disputed: {} } : 
                        { active: {} };

    // Create update instruction
    const updateInstruction = await this.program.methods
      .updateEscrowStatus(anchorStatus, completionScore || null)
      .accounts({
        master: masterPda,
        escrowNft: escrowNftPda,
        metadataAccount: metadataAccount,
        oracle: this.oracle.publicKey,
        tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .instruction();

    // Create and send transaction
    const transaction = new Transaction().add(updateInstruction);
    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.oracle],
      { commitment: 'confirmed' }
    );

    this.logger.logSolanaTransaction('update_status', txHash, { 
      escrowId: operation.escrowId, 
      status, 
      completionScore 
    });
    return txHash;
  }

  private async executeTransferOperation(operation: SolanaOperation): Promise<string> {
    const { toWallet } = operation.data;
    
    // Calculate PDAs
    const [escrowNftPda] = findProgramAddressSync(
      [Buffer.from("escrow_nft"), Buffer.from(operation.escrowId)],
      this.program.programId
    );
    const [mintPda] = findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(operation.escrowId)],
      this.program.programId
    );

    // Get token accounts
    const fromTokenAccount = await this.getAssociatedTokenAddress(mintPda, this.oracle.publicKey);
    const toTokenAccount = await this.getAssociatedTokenAddress(mintPda, toWallet);

    // Create transfer instruction
    const transferInstruction = await this.program.methods
      .transferNft()
      .accounts({
        escrowNft: escrowNftPda,
        fromTokenAccount: fromTokenAccount,
        toTokenAccount: toTokenAccount,
        mintAccount: mintPda,
        owner: this.oracle.publicKey,
        toAuthority: toWallet,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      })
      .instruction();

    // Create and send transaction
    const transaction = new Transaction().add(transferInstruction);
    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.oracle],
      { commitment: 'confirmed' }
    );

    this.logger.logSolanaTransaction('transfer_nft', txHash, { 
      escrowId: operation.escrowId, 
      toWallet: toWallet.toString() 
    });
    return txHash;
  }

  private async handleOperationRetry(operation: SolanaOperation): Promise<void> {
    const retryCount = (operation.retryCount || 0) + 1;
    const maxRetries = this.config.getSyncConfig().retryAttempts;
    
    if (retryCount <= maxRetries) {
      this.logger.warn(`🔄 Retrying operation ${operation.type} for escrow ${operation.escrowId} (${retryCount}/${maxRetries})`);
      
      operation.retryCount = retryCount;
      this.pendingOperations.set(operation.escrowId, operation);
      
      // Add back to queue with delay
      setTimeout(() => {
        this.operationQueue.unshift(operation);
      }, this.config.getSyncConfig().retryDelay * retryCount);
    } else {
      this.logger.error(`❌ Operation ${operation.type} failed permanently for escrow ${operation.escrowId}`);
      this.pendingOperations.delete(operation.escrowId);
    }
  }

  private createOracleFromSeed(seed: string): Keypair {
    const seedBuffer = Buffer.from(seed, 'utf8');
    const seedHash = require('crypto').createHash('sha256').update(seedBuffer).digest();
    return Keypair.fromSeed(seedHash.slice(0, 32));
  }

  private initializeProgram(): Program<TrustlensNftReceipt> {
    // This would be properly initialized with the deployed program
    // For now, we'll create a mock program structure
    const provider = new AnchorProvider(
      this.connection,
      new Wallet(this.oracle),
      { commitment: 'confirmed' }
    );

    return {
      programId: new PublicKey(this.config.getSolanaConfig().programId),
    } as any; // This would be properly typed with the generated program types
  }

  private async getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    // This would use the proper SPL Token library
    // For now, we'll calculate it manually
    const [address] = await PublicKey.findProgramAddress(
      [owner.toBuffer(), new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(), mint.toBuffer()],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );
    return address;
  }

  public getQueueStatus(): any {
    return {
      queueLength: this.operationQueue.length,
      pendingOperations: this.pendingOperations.size,
      isProcessing: this.isProcessing,
      maxConcurrent: this.maxConcurrentOperations,
    };
  }

  public isHealthy(): boolean {
    return this.connection && this.oracle && this.program;
  }

  public getConnectionInfo(): any {
    return {
      rpcUrl: this.config.getSolanaConfig().rpcUrl,
      cluster: this.config.getSolanaConfig().cluster,
      oraclePublicKey: this.oracle.publicKey.toString(),
      programId: this.program.programId.toString(),
    };
  }
}
