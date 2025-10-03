import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      try {
        // Mock wallet connection for demo
        const mockAccount = 'ak_mockAccountAddress123456789';
        const mockBalance = 1000000000000000000; // 1 AE in aettos
        
        setAccount(mockAccount);
        setIsConnected(true);
        setWallet({ 
          address: () => Promise.resolve({ address: mockAccount }),
          balance: () => Promise.resolve(mockBalance)
        });
        toast.success('Mock wallet connected! (Demo mode)');
      } catch (error) {
        console.error('Wallet connection error:', error);
        toast.error(`Connection failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const disconnectWallet = () => {
    setWallet(null);
    setAccount(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  const getBalance = async (address = account) => {
    if (!address) return null;
    
    try {
      // Mock balance for demo
      return 1000000000000000000; // 1 AE
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  };

  const value = {
    wallet,
    account,
    isConnected,
    loading,
    connectWallet,
    disconnectWallet,
    getBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
