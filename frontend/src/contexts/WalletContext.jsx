import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import superheroWalletService from '../services/SuperheroWalletService';

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
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Check wallet availability on mount
  useEffect(() => {
    const checkWallet = () => {
      // Force re-check availability
      superheroWalletService.checkAvailability();
      const status = superheroWalletService.getStatus();
      
      console.log('Wallet status check:', status);
      console.log('Window objects:', {
        superhero: !!window.superhero,
        aepp: !!window.aepp,
        windowKeys: Object.keys(window).filter(key => 
          key.toLowerCase().includes('superhero') || 
          key.toLowerCase().includes('aepp') ||
          key.toLowerCase().includes('wallet')
        )
      });
      
      setIsAvailable(status.isAvailable);
      
      if (status.isConnected && status.account) {
        setAccount(status.account);
        setIsConnected(true);
        setWallet(superheroWalletService.wallet);
        fetchBalance(status.account.address);
      }
    };

    // Initial check with delay to allow extension to load
    setTimeout(checkWallet, 1000);
    
    // Check periodically for wallet availability
    const interval = setInterval(checkWallet, 3000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    
    try {
      const result = await superheroWalletService.connect();
      
      if (result.success) {
        setAccount(result.account);
        setIsConnected(true);
        setWallet(superheroWalletService.wallet);
        await fetchBalance(result.account.address);
        toast.success(`Connected to Superhero Wallet: ${superheroWalletService.formatAddress(result.account.address)}`);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await superheroWalletService.disconnect();
      setWallet(null);
      setAccount(null);
      setBalance(null);
      setIsConnected(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const fetchBalance = async (address = account?.address) => {
    if (!address) return null;
    
    try {
      const balanceResult = await superheroWalletService.getBalance();
      const formattedBalance = superheroWalletService.aettosToAE(balanceResult);
      setBalance(formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  };

  const signTransaction = async (transaction) => {
    if (!isConnected || !wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await superheroWalletService.signTransaction(transaction);
    } catch (error) {
      console.error('Transaction signing error:', error);
      throw error;
    }
  };

  const signMessage = async (message) => {
    if (!isConnected || !wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await superheroWalletService.signMessage(message);
    } catch (error) {
      console.error('Message signing error:', error);
      throw error;
    }
  };

  const deployContract = async (contractSource, initParams = []) => {
    if (!isConnected || !wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await superheroWalletService.deployContract(contractSource, initParams);
    } catch (error) {
      console.error('Contract deployment error:', error);
      throw error;
    }
  };

  const callContract = async (contractAddress, functionName, params = [], options = {}) => {
    if (!isConnected || !wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await superheroWalletService.callContract(contractAddress, functionName, params, options);
    } catch (error) {
      console.error('Contract call error:', error);
      throw error;
    }
  };

  const getNetworkInfo = () => {
    return superheroWalletService.getNetworkInfo();
  };

  const value = {
    wallet,
    account,
    balance,
    isConnected,
    isAvailable,
    loading,
    connectWallet,
    disconnectWallet,
    fetchBalance,
    signTransaction,
    signMessage,
    deployContract,
    callContract,
    getNetworkInfo,
    formatAddress: superheroWalletService.formatAddress,
    aettosToAE: superheroWalletService.aettosToAE,
    aeToAettos: superheroWalletService.aeToAettos
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
