import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import toast from 'react-hot-toast';

const SolanaWalletContext = createContext();

export const useSolanaWallet = () => {
  const context = useContext(SolanaWalletContext);
  if (!context) {
    throw new Error('useSolanaWallet must be used within a SolanaWalletProvider');
  }
  return context;
};

export const SolanaWalletProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [metaplex, setMetaplex] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    initializeSolana();
  }, []);

  const initializeSolana = async () => {
    try {
      // Initialize Solana connection to devnet
      const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
      const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(network);
      
      const newConnection = new Connection(rpcUrl, 'confirmed');
      setConnection(newConnection);

      // Initialize Metaplex
      const newMetaplex = new Metaplex(newConnection);
      setMetaplex(newMetaplex);

      console.log('Solana connection initialized:', rpcUrl);
    } catch (error) {
      console.error('Failed to initialize Solana:', error);
      toast.error('Failed to initialize Solana connection');
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Check if Phantom wallet is available
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const wallet = response.publicKey;
        
        setWallet(wallet);
        setPublicKey(wallet);
        setIsConnected(true);
        
        // Update Metaplex with wallet identity
        if (metaplex) {
          metaplex.use(walletAdapterIdentity({
            publicKey: wallet,
            signTransaction: window.solana.signTransaction,
            signAllTransactions: window.solana.signAllTransactions,
          }));
          setMetaplex(metaplex);
        }
        
        // Fetch balance
        await fetchBalance();
        
        toast.success('Solana wallet connected!');
        console.log('Connected to wallet:', wallet.toString());
      } else {
        // Mock wallet for demo purposes
        await connectMockWallet();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error(`Wallet connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectMockWallet = async () => {
    try {
      // Create mock wallet for demo
      const mockPublicKey = new PublicKey('11111111111111111111111111111111');
      
      setWallet(mockPublicKey);
      setPublicKey(mockPublicKey);
      setIsConnected(true);
      setBalance(1.5); // Mock balance
      
      toast.success('Mock Solana wallet connected! (Demo mode)');
      console.log('Connected to mock wallet:', mockPublicKey.toString());
    } catch (error) {
      console.error('Mock wallet connection failed:', error);
      toast.error('Mock wallet connection failed');
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana && window.solana.disconnect) {
        await window.solana.disconnect();
      }
      
      setWallet(null);
      setPublicKey(null);
      setIsConnected(false);
      setBalance(null);
      
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const fetchBalance = async () => {
    if (!connection || !publicKey) return;
    
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / 1e9); // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const getNfts = async () => {
    if (!metaplex || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
      return nfts;
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      throw error;
    }
  };

  const getNftMetadata = async (mintAddress) => {
    if (!metaplex) {
      throw new Error('Metaplex not initialized');
    }

    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
      return nft;
    } catch (error) {
      console.error('Failed to fetch NFT metadata:', error);
      throw error;
    }
  };

  const value = {
    // Connection
    connection,
    metaplex,
    
    // Wallet state
    wallet,
    publicKey,
    isConnected,
    isConnecting,
    balance,
    
    // Actions
    connectWallet,
    disconnectWallet,
    fetchBalance,
    getNfts,
    getNftMetadata,
  };

  return (
    <SolanaWalletContext.Provider value={value}>
      {children}
    </SolanaWalletContext.Provider>
  );
};
