/**
 * TrustLens AI Service Integration Example
 * 
 * This example shows how to integrate the Solana NFT Receipt program
 * with the TrustLens AI verification service.
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { TrustlensNftClient } = require('../ts/client/trustlens-client');
const axios = require('axios');

class TrustlensCrossChainIntegration {
  constructor(solanaRpcUrl, programId, oracleSeed) {
    this.connection = new Connection(solanaRpcUrl);
    this.programId = new PublicKey(programId);
    this.oracle = TrustlensNftClient.createOracleFromSeed(oracleSeed);
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3001/api';
  }

  /**
   * Handle new escrow created on Aeternity
   * This would be called by an off-chain service monitoring Aeternity
   */
  async handleNewAeternityEscrow(aeternityEscrowData) {
    console.log('🔄 Processing new Aeternity escrow:', aeternityEscrowData.escrowId);

    try {
      // Map Aeternity addresses to Solana addresses
      // In a real implementation, you'd have a mapping service
      const clientSolanaWallet = await this.mapToSolanaAddress(aeternityEscrowData.client);
      const freelancerSolanaWallet = await this.mapToSolanaAddress(aeternityEscrowData.freelancer);

      // Mint NFT on Solana
      const nftMintTx = await this.client.mintEscrowNft(
        this.oracle,
        this.oracle,
        aeternityEscrowData.escrowId,
        clientSolanaWallet,
        freelancerSolanaWallet,
        aeternityEscrowData.amount,
        aeternityEscrowData.projectDescription
      );

      console.log('✅ NFT minted successfully:', nftMintTx);

      // Notify AI service about new escrow for monitoring
      await this.notifyAiServiceNewEscrow(aeternityEscrowData);

      return {
        success: true,
        nftMintTx,
        escrowId: aeternityEscrowData.escrowId
      };

    } catch (error) {
      console.error('❌ Failed to process new escrow:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle AI verification completion
   * This would be called by the AI verification service
   */
  async handleAiVerificationComplete(escrowId, aiResult) {
    console.log('🤖 Processing AI verification for escrow:', escrowId);

    try {
      // Update NFT status based on AI recommendation
      const newStatus = aiResult.recommendation === 'release' 
        ? { released: {} } 
        : { disputed: {} };

      const updateTx = await this.client.updateEscrowStatus(
        this.oracle,
        escrowId,
        newStatus,
        aiResult.completionScore
      );

      console.log('✅ NFT status updated:', updateTx);

      // Trigger smart contract action on Aeternity if needed
      if (aiResult.recommendation === 'release' && aiResult.completionScore >= 70) {
        await this.triggerAeternityRelease(escrowId);
      }

      return {
        success: true,
        updateTx,
        recommendation: aiResult.recommendation,
        score: aiResult.completionScore
      };

    } catch (error) {
      console.error('❌ Failed to update NFT status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle escrow completion on Aeternity
   * This would be called when escrow is released/disputed on Aeternity
   */
  async handleAeternityEscrowCompletion(escrowId, finalStatus) {
    console.log('🏁 Processing escrow completion:', escrowId);

    try {
      // Update NFT status to match Aeternity
      const newStatus = finalStatus === 'released' 
        ? { released: {} } 
        : { disputed: {} };

      const updateTx = await this.client.updateEscrowStatus(
        this.oracle,
        escrowId,
        newStatus
      );

      console.log('✅ NFT updated with final status:', updateTx);

      // NFT is now transferable (soulbound removed)
      const escrowData = await this.client.getEscrowData(escrowId);
      console.log('🎉 NFT is now transferable!');

      return {
        success: true,
        updateTx,
        finalStatus,
        transferable: true
      };

    } catch (error) {
      console.error('❌ Failed to update final status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comprehensive escrow data from both chains
   */
  async getCrossChainEscrowData(escrowId) {
    try {
      // Get Solana NFT data
      const solanaData = await this.client.getEscrowData(escrowId);

      // Get Aeternity escrow data (mock for example)
      const aeternityData = await this.getAeternityEscrowData(escrowId);

      // Get AI verification data
      const aiData = await this.getAiVerificationData(escrowId);

      return {
        escrowId,
        solana: {
          nftAddress: solanaData.escrowId, // This would be the NFT mint address
          status: solanaData.status,
          completionScore: solanaData.completionScore,
          isTransferable: !solanaData.isSoulbound,
          timestamp: solanaData.timestamp
        },
        aeternity: aeternityData,
        ai: aiData,
        crossChainStatus: this.determineCrossChainStatus(solanaData, aeternityData)
      };

    } catch (error) {
      console.error('❌ Failed to get cross-chain data:', error);
      throw error;
    }
  }

  // Helper methods

  async mapToSolanaAddress(aeternityAddress) {
    // In a real implementation, this would query a mapping service
    // For now, we'll generate a deterministic Solana address
    const seed = `solana_${aeternityAddress}`;
    const keypair = TrustlensNftClient.createOracleFromSeed(seed);
    return keypair.publicKey;
  }

  async notifyAiServiceNewEscrow(escrowData) {
    try {
      await axios.post(`${this.aiServiceUrl}/monitoring/register-escrow`, {
        escrowId: escrowData.escrowId,
        projectDescription: escrowData.projectDescription,
        clientWallet: escrowData.client,
        freelancerWallet: escrowData.freelancer,
        amount: escrowData.amount,
        deadline: escrowData.deadline,
        chain: 'aeternity',
        nftChain: 'solana'
      });
      console.log('✅ AI service notified of new escrow');
    } catch (error) {
      console.error('⚠️  Failed to notify AI service:', error.message);
    }
  }

  async triggerAeternityRelease(escrowId) {
    // In a real implementation, this would trigger the release
    // on the Aeternity smart contract
    console.log('🎯 Triggering Aeternity escrow release for:', escrowId);
    // Implementation would depend on your Aeternity integration
  }

  async getAeternityEscrowData(escrowId) {
    // Mock Aeternity data - in real implementation, query Aeternity node
    return {
      contractAddress: `ct_${escrowId}`,
      status: 'active',
      amount: '1000000000000000000', // 1 AE
      deadline: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      client: 'ak_clientAddress',
      freelancer: 'ak_freelancerAddress',
      mediator: 'ak_mediatorAddress'
    };
  }

  async getAiVerificationData(escrowId) {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/verification/history/${escrowId}`);
      return response.data;
    } catch (error) {
      return null; // No AI data available
    }
  }

  determineCrossChainStatus(solanaData, aeternityData) {
    if (solanaData.status.variant === 'released' && aeternityData.status === 'released') {
      return 'synchronized_released';
    } else if (solanaData.status.variant === 'disputed' && aeternityData.status === 'disputed') {
      return 'synchronized_disputed';
    } else if (solanaData.status.variant === 'active' && aeternityData.status === 'active') {
      return 'synchronized_active';
    } else {
      return 'desynchronized';
    }
  }
}

// Example usage
async function example() {
  const integration = new TrustlensCrossChainIntegration(
    'http://localhost:8899', // Local Solana RPC
    'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS', // Program ID
    'trustlens-oracle-localnet' // Oracle seed
  );

  // Example 1: New escrow created on Aeternity
  const newEscrowData = {
    escrowId: 'ae_escrow_123456789',
    client: 'ak_clientAddress123',
    freelancer: 'ak_freelancerAddress456',
    amount: 1000000000000000000, // 1 AE in aettos
    projectDescription: 'Build a DeFi dashboard with real-time price feeds',
    deadline: Date.now() + (30 * 24 * 60 * 60 * 1000)
  };

  const result1 = await integration.handleNewAeternityEscrow(newEscrowData);
  console.log('New escrow result:', result1);

  // Example 2: AI verification completes
  const aiResult = {
    completionScore: 88,
    recommendation: 'release',
    reasoning: 'High quality delivery with all requirements met'
  };

  const result2 = await integration.handleAiVerificationComplete(
    newEscrowData.escrowId,
    aiResult
  );
  console.log('AI verification result:', result2);

  // Example 3: Escrow completed on Aeternity
  const result3 = await integration.handleAeternityEscrowCompletion(
    newEscrowData.escrowId,
    'released'
  );
  console.log('Completion result:', result3);

  // Example 4: Get cross-chain data
  const crossChainData = await integration.getCrossChainEscrowData(
    newEscrowData.escrowId
  );
  console.log('Cross-chain data:', JSON.stringify(crossChainData, null, 2));
}

// Export for use in other modules
module.exports = {
  TrustlensCrossChainIntegration
};

// Run example if this file is executed directly
if (require.main === module) {
  example().catch(console.error);
}
