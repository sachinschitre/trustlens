import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TrustlensNftReceipt } from "../target/types/trustlens_nft_receipt";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TrustlensNftClient, TrustlensAiIntegration } from "./trustlens-client";

describe("trustlens-nft-receipt", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TrustlensNftReceipt as Program<TrustlensNftReceipt>;
  const provider = anchor.getProvider();

  // Create test accounts
  const oracle = Keypair.generate();
  const clientWallet = Keypair.generate();
  const freelancerWallet = Keypair.generate();
  const recipientWallet = Keypair.generate();

  const client = new TrustlensNftClient(program);
  const aiIntegration = new TrustlensAiIntegration(client, oracle);

  const escrowId = "test-escrow-001";
  const projectDescription = "Create a responsive website with contact form";
  const amount = 1000000000; // 1 SOL in lamports

  it("Initialize the program", async () => {
    // Fund the oracle account
    await provider.connection.requestAirdrop(oracle.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

    const tx = await client.initialize(oracle);
    console.log("Initialize transaction:", tx);

    // Verify master account was created
    const masterData = await client.getMasterData();
    expect(masterData.authority.toString()).to.equal(oracle.publicKey.toString());
    expect(masterData.totalMinted.toNumber()).to.equal(0);
  });

  it("Mint NFT for escrow deal", async () => {
    const tx = await client.mintEscrowNft(
      oracle,
      oracle,
      escrowId,
      clientWallet.publicKey,
      freelancerWallet.publicKey,
      amount,
      projectDescription
    );

    console.log("Mint NFT transaction:", tx);

    // Verify escrow data
    const escrowData = await client.getEscrowData(escrowId);
    expect(escrowData.escrowId).to.equal(escrowId);
    expect(escrowData.clientWallet.toString()).to.equal(clientWallet.publicKey.toString());
    expect(escrowData.freelancerWallet.toString()).to.equal(freelancerWallet.publicKey.toString());
    expect(escrowData.amount.toNumber()).to.equal(amount);
    expect(escrowData.status).to.deep.equal({ active: {} });
    expect(escrowData.completionScore).to.be.null;
    expect(escrowData.projectDescription).to.equal(projectDescription);

    // Verify master counter increased
    const masterData = await client.getMasterData();
    expect(masterData.totalMinted.toNumber()).to.equal(1);
  });

  it("Update escrow status after AI verification", async () => {
    const completionScore = 85;
    const tx = await aiIntegration.updateAfterAiVerification(
      escrowId,
      completionScore,
      "release"
    );

    console.log("Update status transaction:", tx);

    // Verify escrow data updated
    const escrowData = await client.getEscrowData(escrowId);
    expect(escrowData.status).to.deep.equal({ released: {} });
    expect(escrowData.completionScore).to.equal(completionScore);
  });

  it("Transfer NFT after escrow completion", async () => {
    // First, we need to get the NFT to the client wallet
    // This would normally happen during the mint process
    // For testing, we'll simulate the NFT being in the client's wallet

    const tx = await client.transferNft(
      clientWallet,
      recipientWallet.publicKey,
      escrowId
    );

    console.log("Transfer NFT transaction:", tx);
  });

  it("Test AI integration workflow", async () => {
    const newEscrowId = "test-escrow-002";
    
    // Step 1: Create new escrow NFT
    await aiIntegration.createEscrowNft(
      newEscrowId,
      clientWallet.publicKey,
      freelancerWallet.publicKey,
      amount,
      "Design a mobile app with authentication"
    );

    // Step 2: Simulate AI verification
    await aiIntegration.updateAfterAiVerification(
      newEscrowId,
      72,
      "dispute"
    );

    // Step 3: Verify final state
    const escrowData = await client.getEscrowData(newEscrowId);
    expect(escrowData.status).to.deep.equal({ disputed: {} });
    expect(escrowData.completionScore).to.equal(72);
  });

  it("Test soulbound behavior", async () => {
    const soulboundEscrowId = "test-soulbound-001";
    
    // Create escrow NFT
    await client.mintEscrowNft(
      oracle,
      oracle,
      soulboundEscrowId,
      clientWallet.publicKey,
      freelancerWallet.publicKey,
      amount,
      projectDescription
    );

    // Try to transfer before completion (should fail)
    try {
      await client.transferNft(
        clientWallet,
        recipientWallet.publicKey,
        soulboundEscrowId
      );
      expect.fail("Transfer should have failed for soulbound NFT");
    } catch (error) {
      expect(error.message).to.include("NftStillSoulbound");
    }

    // Complete the escrow
    await client.updateEscrowStatus(
      oracle,
      soulboundEscrowId,
      { released: {} }
    );

    // Now transfer should succeed
    await client.transferNft(
      clientWallet,
      recipientWallet.publicKey,
      soulboundEscrowId
    );
  });

  it("Test unauthorized oracle", async () => {
    const unauthorizedOracle = Keypair.generate();
    
    try {
      await client.mintEscrowNft(
        unauthorizedOracle,
        unauthorizedOracle,
        "unauthorized-test",
        clientWallet.publicKey,
        freelancerWallet.publicKey,
        amount,
        projectDescription
      );
      expect.fail("Should have failed with unauthorized oracle");
    } catch (error) {
      expect(error.message).to.include("UnauthorizedOracle");
    }
  });
});

/**
 * Integration test with real Aeternity escrow data
 */
describe("Aeternity Integration", () => {
  const program = anchor.workspace.TrustlensNftReceipt as Program<TrustlensNftReceipt>;
  const client = new TrustlensNftClient(program);
  const oracle = TrustlensNftClient.createOracleFromSeed("trustlens-oracle-seed");

  it("Simulate real escrow workflow", async () => {
    // Simulate escrow created on Aeternity
    const aeternityEscrowId = "ae_escrow_123456789";
    const clientSolanaWallet = new PublicKey("11111111111111111111111111111111");
    const freelancerSolanaWallet = new PublicKey("22222222222222222222222222222222");
    
    // Step 1: Mint NFT when escrow is created
    await client.mintEscrowNft(
      oracle,
      oracle,
      aeternityEscrowId,
      clientSolanaWallet,
      freelancerSolanaWallet,
      5000000000, // 5 SOL
      "Build a DeFi dashboard with real-time price feeds and portfolio tracking"
    );

    // Step 2: AI verification (simulate from our AI service)
    const aiVerificationResult = {
      completionScore: 88,
      recommendation: "release" as const
    };

    await client.updateEscrowStatus(
      oracle,
      aeternityEscrowId,
      aiVerificationResult.recommendation === "release" 
        ? { released: {} } 
        : { disputed: {} },
      aiVerificationResult.completionScore
    );

    // Step 3: Verify final state
    const finalEscrowData = await client.getEscrowData(aeternityEscrowId);
    console.log("Final escrow data:", finalEscrowData);
    
    expect(finalEscrowData.status).to.deep.equal({ released: {} });
    expect(finalEscrowData.completionScore).to.equal(88);
  });
});
