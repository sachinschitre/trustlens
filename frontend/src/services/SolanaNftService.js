import { PublicKey } from '@solana/web3.js';

class SolanaNftService {
  constructor(metaplex, connection, publicKey) {
    this.metaplex = metaplex;
    this.connection = connection;
    this.publicKey = publicKey;
    this.trustlensProgramId = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
  }

  /**
   * Get all NFTs owned by the connected wallet
   */
  async getAllNfts() {
    try {
      if (!this.metaplex || !this.publicKey) {
        throw new Error('Wallet not connected');
      }

      const nfts = await this.metaplex.nfts().findAllByOwner({ owner: this.publicKey });
      
      // Filter for TrustLens NFTs and parse metadata
      const trustlensNfts = [];
      
      for (const nft of nfts) {
        try {
          // Check if this is a TrustLens NFT by looking at the collection or metadata
          const isTrustlensNft = await this.isTrustlensNft(nft);
          
          if (isTrustlensNft) {
            const parsedNft = await this.parseTrustlensNft(nft);
            if (parsedNft) {
              trustlensNfts.push(parsedNft);
            }
          }
        } catch (error) {
          console.warn('Failed to parse NFT:', nft.mintAddress.toString(), error);
        }
      }

      return trustlensNfts;
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      throw error;
    }
  }

  /**
   * Check if an NFT is a TrustLens NFT
   */
  async isTrustlensNft(nft) {
    try {
      // Check if the NFT has TrustLens-specific metadata
      const metadata = await this.metaplex.nfts().load({ metadata: nft });
      
      // Check for TrustLens indicators
      const name = metadata.name;
      const symbol = metadata.symbol;
      const uri = metadata.uri;
      
      // TrustLens NFTs should have specific naming patterns
      const isTrustlensName = name && name.includes('TrustLens');
      const isTrustlensSymbol = symbol && symbol === 'TRUST';
      const isTrustlensUri = uri && uri.includes('trustlens.io');
      
      return isTrustlensName || isTrustlensSymbol || isTrustlensUri;
    } catch (error) {
      console.warn('Failed to check if NFT is TrustLens:', error);
      return false;
    }
  }

  /**
   * Parse TrustLens NFT metadata
   */
  async parseTrustlensNft(nft) {
    try {
      const metadata = await this.metaplex.nfts().load({ metadata: nft });
      
      // Extract escrow data from metadata URI or name
      const escrowData = this.extractEscrowDataFromMetadata(metadata);
      
      if (!escrowData) {
        return null;
      }

      return {
        mintAddress: nft.mintAddress.toString(),
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        image: metadata.image,
        escrowId: escrowData.escrowId,
        status: escrowData.status,
        completionScore: escrowData.completionScore,
        amount: escrowData.amount,
        clientWallet: escrowData.clientWallet,
        freelancerWallet: escrowData.freelancerWallet,
        timestamp: escrowData.timestamp,
        projectDescription: escrowData.projectDescription,
        isTransferable: escrowData.isTransferable,
        createdAt: nft.createdAt,
        updatedAt: nft.updatedAt,
      };
    } catch (error) {
      console.error('Failed to parse TrustLens NFT:', error);
      return null;
    }
  }

  /**
   * Extract escrow data from NFT metadata
   */
  extractEscrowDataFromMetadata(metadata) {
    try {
      // Parse escrow ID from name (format: "TrustLens Escrow #escrow_id - status")
      const nameMatch = metadata.name?.match(/TrustLens Escrow #(.+?) - (.+)/);
      if (!nameMatch) {
        return null;
      }

      const escrowId = nameMatch[1];
      const statusText = nameMatch[2];

      // Map status text to enum
      let status = 'active';
      if (statusText.toLowerCase().includes('released')) {
        status = 'released';
      } else if (statusText.toLowerCase().includes('disputed')) {
        status = 'disputed';
      }

      // Extract additional data from URI or description
      // In a real implementation, this would fetch from the metadata URI
      const mockEscrowData = this.generateMockEscrowData(escrowId, status);

      return {
        escrowId,
        status,
        ...mockEscrowData,
      };
    } catch (error) {
      console.error('Failed to extract escrow data:', error);
      return null;
    }
  }

  /**
   * Generate mock escrow data for demo purposes
   * In production, this would be fetched from the actual metadata URI
   */
  generateMockEscrowData(escrowId, status) {
    const baseAmount = 1000000000; // 1 SOL in lamports
    const randomMultiplier = Math.floor(Math.random() * 10) + 1;
    
    return {
      completionScore: status === 'released' ? Math.floor(Math.random() * 30) + 70 : 
                     status === 'disputed' ? Math.floor(Math.random() * 40) + 30 :
                     null,
      amount: baseAmount * randomMultiplier,
      clientWallet: 'ak_clientAddress123456789',
      freelancerWallet: 'ak_freelancerAddress987654321',
      timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time within last 30 days
      projectDescription: `Escrow project #${escrowId} - ${this.getRandomProjectDescription()}`,
      isTransferable: status === 'released' || status === 'disputed',
    };
  }

  /**
   * Get random project description for demo
   */
  getRandomProjectDescription() {
    const descriptions = [
      'Build a responsive website with contact form',
      'Create a mobile app with user authentication',
      'Design a logo and branding package',
      'Write technical documentation for API',
      'Develop a DeFi dashboard with real-time data',
      'Create marketing materials for product launch',
      'Build an e-commerce platform with payment integration',
      'Design and implement a database schema',
      'Create automated testing suite',
      'Develop a blockchain smart contract',
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  /**
   * Get NFT by mint address
   */
  async getNftByMint(mintAddress) {
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const nft = await this.metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
      
      if (await this.isTrustlensNft(nft)) {
        return await this.parseTrustlensNft(nft);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get NFT by mint:', error);
      throw error;
    }
  }

  /**
   * Filter NFTs by status
   */
  filterNftsByStatus(nfts, status) {
    if (!status || status === 'all') {
      return nfts;
    }
    
    return nfts.filter(nft => nft.status === status);
  }

  /**
   * Sort NFTs by creation date
   */
  sortNfts(nfts, sortBy = 'newest') {
    const sorted = [...nfts];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'amount_high':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'amount_low':
        return sorted.sort((a, b) => a.amount - b.amount);
      case 'score_high':
        return sorted.sort((a, b) => (b.completionScore || 0) - (a.completionScore || 0));
      case 'score_low':
        return sorted.sort((a, b) => (a.completionScore || 0) - (b.completionScore || 0));
      default:
        return sorted;
    }
  }

  /**
   * Get escrow contract data from Solana program
   * This would interact with the actual TrustLens program
   */
  async getEscrowContractData(escrowId) {
    try {
      // In a real implementation, this would query the TrustLens program
      // For now, we'll return mock data with a generated PDA address
      const escrowNftPda = this.generatePdaAddress(escrowId);

      // Mock contract data
      return {
        escrowId,
        contractAddress: escrowNftPda,
        status: 'active',
        amount: 1000000000,
        client: 'ak_clientAddress123456789',
        freelancer: 'ak_freelancerAddress987654321',
        mediator: 'ak_mediatorAddress456789123',
        deadline: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        disputed: false,
      };
    } catch (error) {
      console.error('Failed to get escrow contract data:', error);
      throw error;
    }
  }

  /**
   * Generate a PDA address for demo purposes
   * In production, this would use the actual Solana program's PDA generation
   */
  generatePdaAddress(escrowId) {
    try {
      // Create a deterministic address using crypto hash
      const seed = `escrow_nft_${escrowId}`;
      const seedBuffer = Buffer.from(seed, 'utf8');
      const seedHash = require('crypto').createHash('sha256').update(seedBuffer).digest();
      
      // Generate a mock PublicKey from the hash
      const mockKeypair = require('@solana/web3.js').Keypair.fromSeed(seedHash.slice(0, 32));
      return mockKeypair.publicKey.toString();
    } catch (error) {
      // Fallback to a simple generated address
      return `escrow_${escrowId}_${Math.random().toString(36).substring(7)}`;
    }
  }

  /**
   * Get statistics for NFT collection
   */
  getNftStats(nfts) {
    const stats = {
      total: nfts.length,
      active: 0,
      released: 0,
      disputed: 0,
      totalValue: 0,
      averageScore: 0,
    };

    let totalScore = 0;
    let scoredCount = 0;

    nfts.forEach(nft => {
      stats[nft.status]++;
      stats.totalValue += nft.amount;
      
      if (nft.completionScore) {
        totalScore += nft.completionScore;
        scoredCount++;
      }
    });

    stats.totalValue = stats.totalValue / 1e9; // Convert to SOL
    stats.averageScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;

    return stats;
  }
}

export default SolanaNftService;
