import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TrustlensNftReceipt } from "../target/types/trustlens_nft_receipt";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TrustlensNftClient } from "../ts/client/trustlens-client";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying TrustLens NFT Receipt Program...");

  // Configure the client to use the appropriate cluster
  const cluster = process.env.CLUSTER || "localnet";
  console.log(`📡 Connecting to ${cluster} cluster`);

  // Set up provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TrustlensNftReceipt as Program<TrustlensNftReceipt>;
  console.log("📋 Program ID:", program.programId.toString());

  // Create oracle keypair
  const oracleSeed = process.env.ORACLE_SEED || "trustlens-oracle-production";
  const oracle = TrustlensNftClient.createOracleFromSeed(oracleSeed);
  console.log("🔑 Oracle Public Key:", oracle.publicKey.toString());

  // Fund oracle if on localnet
  if (cluster === "localnet") {
    try {
      console.log("💰 Funding oracle account...");
      await provider.connection.requestAirdrop(oracle.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      console.log("✅ Oracle funded");
    } catch (error) {
      console.log("⚠️  Could not fund oracle:", error.message);
    }
  }

  // Initialize the program
  const client = new TrustlensNftClient(program);
  console.log("🔧 Initializing program...");
  
  try {
    const tx = await client.initialize(oracle);
    console.log("✅ Program initialized successfully!");
    console.log("📝 Transaction:", tx);

    // Verify initialization
    const masterData = await client.getMasterData();
    console.log("📊 Master Account Data:");
    console.log("   Authority:", masterData.authority.toString());
    console.log("   Total Minted:", masterData.totalMinted.toNumber());

  } catch (error) {
    console.error("❌ Failed to initialize program:", error);
    process.exit(1);
  }

  // Save deployment info
  const deploymentInfo = {
    programId: program.programId.toString(),
    oraclePublicKey: oracle.publicKey.toString(),
    oracleSeed: oracleSeed,
    cluster: cluster,
    deployedAt: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Update your AI service to use the oracle keypair");
  console.log("2. Configure the oracle seed in your environment");
  console.log("3. Test minting NFTs with your Aeternity escrows");
  console.log("\n🔑 Oracle Private Key (keep secure!):");
  console.log(oracle.secretKey.toString());
}

main().catch((error) => {
  console.error("💥 Deployment failed:", error);
  process.exit(1);
});
