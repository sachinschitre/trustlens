import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TrustlensNftReceipt } from "../target/types/trustlens_nft_receipt";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { 
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { findProgramAddressSync } from "@coral-xyz/anchor/dist/cjs/utils/pubkey";
import bs58 from "bs58";

export class TrustlensNftClient {
  private program: Program<TrustlensNftReceipt>;
  private provider: anchor.AnchorProvider;

  constructor(program: Program<TrustlensNftReceipt>) {
    this.program = program;
    this.provider = program.provider as anchor.AnchorProvider;
  }

  /**
   * Initialize the NFT receipt program
   * @param authority - The oracle authority keypair
   */
  async initialize(authority: Keypair): Promise<string> {
    const [masterPda] = findProgramAddressSync([Buffer.from("master")], this.program.programId);
    
    const tx = await this.program.methods
      .initialize()
      .accounts({
        master: masterPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("Program initialized:", tx);
    return tx;
  }

  /**
   * Mint a new NFT receipt for an Aeternity escrow deal
   * @param oracle - Oracle authority keypair
   * @param payer - Payer keypair
   * @param escrowId - Unique escrow ID from Aeternity
   * @param clientWallet - Client's Solana wallet public key
   * @param freelancerWallet - Freelancer's Solana wallet public key
   * @param amount - Escrow amount in lamports
   * @param projectDescription - Project description
   */
  async mintEscrowNft(
    oracle: Keypair,
    payer: Keypair,
    escrowId: string,
    clientWallet: PublicKey,
    freelancerWallet: PublicKey,
    amount: number,
    projectDescription: string
  ): Promise<string> {
    const [masterPda] = findProgramAddressSync([Buffer.from("master")], this.program.programId);
    const [escrowNftPda] = findProgramAddressSync(
      [Buffer.from("escrow_nft"), Buffer.from(escrowId)],
      this.program.programId
    );
    const [mintPda] = findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(escrowId)],
      this.program.programId
    );

    // Get metadata account
    const metadataAccount = findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPda.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    const tx = await this.program.methods
      .mintEscrowNft(
        escrowId,
        clientWallet,
        freelancerWallet,
        new anchor.BN(amount),
        projectDescription
      )
      .accounts({
        master: masterPda,
        escrowNft: escrowNftPda,
        mintAccount: mintPda,
        metadataAccount: metadataAccount,
        oracle: oracle.publicKey,
        payer: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([oracle, payer])
      .rpc();

    console.log("NFT minted for escrow:", escrowId);
    console.log("Transaction:", tx);
    return tx;
  }

  /**
   * Update escrow status (only oracle can call)
   * @param oracle - Oracle authority keypair
   * @param escrowId - Escrow ID to update
   * @param newStatus - New escrow status
   * @param completionScore - Optional completion score (0-100)
   */
  async updateEscrowStatus(
    oracle: Keypair,
    escrowId: string,
    newStatus: { active?: {} } | { released?: {} } | { disputed?: {} },
    completionScore?: number
  ): Promise<string> {
    const [masterPda] = findProgramAddressSync([Buffer.from("master")], this.program.programId);
    const [escrowNftPda] = findProgramAddressSync(
      [Buffer.from("escrow_nft"), Buffer.from(escrowId)],
      this.program.programId
    );

    // Get metadata account
    const [mintPda] = findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(escrowId)],
      this.program.programId
    );
    const metadataAccount = findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPda.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    const tx = await this.program.methods
      .updateEscrowStatus(newStatus, completionScore ? completionScore : null)
      .accounts({
        master: masterPda,
        escrowNft: escrowNftPda,
        metadataAccount: metadataAccount,
        oracle: oracle.publicKey,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([oracle])
      .rpc();

    console.log("Escrow status updated:", escrowId);
    console.log("New status:", newStatus);
    console.log("Transaction:", tx);
    return tx;
  }

  /**
   * Transfer NFT (only allowed after escrow completion)
   * @param owner - Current NFT owner keypair
   * @param toAuthority - Recipient public key
   * @param escrowId - Escrow ID
   */
  async transferNft(
    owner: Keypair,
    toAuthority: PublicKey,
    escrowId: string
  ): Promise<string> {
    const [escrowNftPda] = findProgramAddressSync(
      [Buffer.from("escrow_nft"), Buffer.from(escrowId)],
      this.program.programId
    );
    const [mintPda] = findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(escrowId)],
      this.program.programId
    );

    const fromTokenAccount = await getAssociatedTokenAddress(mintPda, owner.publicKey);
    const toTokenAccount = await getAssociatedTokenAddress(mintPda, toAuthority);

    const tx = await this.program.methods
      .transferNft()
      .accounts({
        escrowNft: escrowNftPda,
        fromTokenAccount: fromTokenAccount,
        toTokenAccount: toTokenAccount,
        mintAccount: mintPda,
        owner: owner.publicKey,
        toAuthority: toAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([owner])
      .rpc();

    console.log("NFT transferred successfully");
    console.log("Transaction:", tx);
    return tx;
  }

  /**
   * Get escrow data from NFT
   * @param escrowId - Escrow ID
   */
  async getEscrowData(escrowId: string) {
    const [escrowNftPda] = findProgramAddressSync(
      [Buffer.from("escrow_nft"), Buffer.from(escrowId)],
      this.program.programId
    );

    const escrowNft = await this.program.account.escrowNft.fetch(escrowNftPda);
    return escrowNft.escrowData;
  }

  /**
   * Get master account data
   */
  async getMasterData() {
    const [masterPda] = findProgramAddressSync([Buffer.from("master")], this.program.programId);
    return await this.program.account.master.fetch(masterPda);
  }

  /**
   * Create oracle keypair from seed
   * @param seed - Seed string for deterministic keypair
   */
  static createOracleFromSeed(seed: string): Keypair {
    const seedBuffer = Buffer.from(seed, 'utf8');
    const seedHash = anchor.utils.sha256(seedBuffer);
    return Keypair.fromSeed(seedHash.slice(0, 32));
  }

  /**
   * Verify oracle signature for off-chain integration
   * @param message - Message to verify
   * @param signature - Signature to verify
   * @param oraclePublicKey - Oracle public key
   */
  static verifyOracleSignature(
    message: string,
    signature: string,
    oraclePublicKey: PublicKey
  ): boolean {
    try {
      const messageBuffer = Buffer.from(message, 'utf8');
      const signatureBuffer = bs58.decode(signature);
      
      return anchor.utils.verify(messageBuffer, signatureBuffer, oraclePublicKey.toBuffer());
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }
}

/**
 * Integration helper for TrustLens AI service
 */
export class TrustlensAiIntegration {
  private client: TrustlensNftClient;
  private oracle: Keypair;

  constructor(client: TrustlensNftClient, oracle: Keypair) {
    this.client = client;
    this.oracle = oracle;
  }

  /**
   * Mint NFT when new escrow is created on Aeternity
   */
  async createEscrowNft(
    aeternityEscrowId: string,
    clientWallet: PublicKey,
    freelancerWallet: PublicKey,
    amount: number,
    projectDescription: string
  ): Promise<string> {
    return await this.client.mintEscrowNft(
      this.oracle,
      this.oracle, // Using oracle as payer for simplicity
      aeternityEscrowId,
      clientWallet,
      freelancerWallet,
      amount,
      projectDescription
    );
  }

  /**
   * Update NFT when AI verification completes
   */
  async updateAfterAiVerification(
    escrowId: string,
    completionScore: number,
    recommendation: "release" | "dispute"
  ): Promise<string> {
    const status = recommendation === "release" 
      ? { released: {} } 
      : { disputed: {} };

    return await this.client.updateEscrowStatus(
      this.oracle,
      escrowId,
      status,
      completionScore
    );
  }

  /**
   * Update NFT when escrow is released on Aeternity
   */
  async markEscrowReleased(escrowId: string): Promise<string> {
    return await this.client.updateEscrowStatus(
      this.oracle,
      escrowId,
      { released: {} }
    );
  }

  /**
   * Update NFT when escrow is disputed on Aeternity
   */
  async markEscrowDisputed(escrowId: string): Promise<string> {
    return await this.client.updateEscrowStatus(
      this.oracle,
      escrowId,
      { disputed: {} }
    );
  }
}
