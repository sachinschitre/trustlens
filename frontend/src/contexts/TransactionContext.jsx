/**
 * Transaction Context
 * Manages transaction state across the entire application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const TransactionContext = createContext();

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [recentTransaction, setRecentTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('trustlens_transactions');
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        // Filter out old dummy/sample transactions
        const realTransactions = parsed.filter(tx => 
          tx.source !== 'sample' && 
          tx.source !== 'sample_fallback' &&
          !tx.txHash?.includes('th_2K9q4L8mN3pQ7rS5tU9vW1xY4zA6bC8dE0fG2hI5jK7lM9nO1pQ3rS5tU7vW9xY') &&
          !tx.txHash?.includes('th_3L0r5M9nO4qR8sT6uV0wX2yZ5aB7cD9eF1gH3iJ6kL8mN0oP2qR4sT6uV8wX0yZ')
        );
        setTransactions(realTransactions);
        console.log('Loaded real transactions from localStorage:', realTransactions);
      } catch (error) {
        console.error('Error loading saved transactions:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('trustlens_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...transaction
    };

    console.log('Adding transaction to context:', newTransaction);
    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      console.log('Updated transactions array:', updated);
      return updated;
    });
    setRecentTransaction(newTransaction);
    
    toast.success(`Transaction ${transaction.type} initiated`, {
      duration: 3000,
      icon: '🚀'
    });

    return newTransaction;
  };

  const updateTransaction = (transactionId, updates) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId ? { ...tx, ...updates } : tx
      )
    );

    // Update recent transaction if it matches
    if (recentTransaction?.id === transactionId) {
      setRecentTransaction(prev => ({ ...prev, ...updates }));
    }

    if (updates.status === 'confirmed') {
      toast.success(`Transaction ${updates.type || 'completed'} confirmed!`, {
        duration: 4000,
        icon: '✅'
      });
    }
  };

  const getTransactionsByType = (type) => {
    return transactions.filter(tx => tx.type === type);
  };

  const getRecentTransactions = (limit = 5) => {
    console.log('Getting recent transactions:', transactions.slice(0, limit));
    return transactions.slice(0, limit);
  };

  const clearTransactions = () => {
    setTransactions([]);
    setRecentTransaction(null);
    localStorage.removeItem('trustlens_transactions');
    toast.info('Transaction history cleared');
  };

  const fetchBlockchainTransactions = async (accountAddress) => {
    if (!accountAddress) return [];

    setLoading(true);
    try {
      // Try different API endpoints for Aeternity testnet
      const endpoints = [
        `https://testnet.aeternity.io/v3/transactions/account/${accountAddress}?limit=50`,
        `https://testnet.aeternity.io/middleware/transactions/account/${accountAddress}?limit=50`,
        `https://testnet.aeternity.io/mdw/transactions/account/${accountAddress}?limit=50`,
        `https://testnet.aeternity.io/v2/transactions/account/${accountAddress}?limit=50`
      ];

      let response;
      let data;
      let lastError;

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying API endpoint: ${endpoint}`);
          response = await fetch(endpoint);
          
          if (response.ok) {
            data = await response.json();
            console.log(`Success with endpoint: ${endpoint}`, data);
            break;
          } else {
            lastError = new Error(`HTTP error! status: ${response.status} for ${endpoint}`);
            console.log(`Failed with endpoint: ${endpoint}, status: ${response.status}`);
          }
        } catch (error) {
          lastError = error;
          console.log(`Error with endpoint: ${endpoint}`, error);
        }
      }

      // If all endpoints failed, throw the last error
      if (!response || !response.ok) {
        throw lastError || new Error('All API endpoints failed');
      }
      
      if (data.data && Array.isArray(data.data)) {
        const formattedTransactions = data.data.map((tx, index) => ({
          id: `blockchain_${tx.tx?.hash || tx.hash}_${index}`,
          txHash: tx.tx?.hash || tx.hash,
          type: getTransactionType(tx),
          amount: getTransactionAmount(tx),
          from: tx.tx?.sender_id || tx.sender_id,
          to: tx.tx?.recipient_id || tx.recipient_id,
          status: tx.block_height ? 'confirmed' : 'pending',
          timestamp: new Date(tx.time * 1000).toISOString(),
          gasUsed: tx.tx?.gas_used || tx.gas_used || 0,
          gasPrice: tx.tx?.gas_price || tx.gas_price || 0,
          blockNumber: tx.block_height || null,
          confirmations: tx.block_height ? Math.max(0, 1000 - tx.block_height) : 0,
          source: 'blockchain'
        }));

        // Merge with existing transactions, avoiding duplicates
        setTransactions(prev => {
          const existingHashes = new Set(prev.map(tx => tx.txHash));
          const newTransactions = formattedTransactions.filter(tx => !existingHashes.has(tx.txHash));
          return [...newTransactions, ...prev];
        });

        return formattedTransactions;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching blockchain transactions:', error);
      
      // If API fails, just return empty array - real transactions will be created by user actions
      console.log('Blockchain API unavailable - transactions will be created when user performs escrow actions');
      
      // Don't show error toast automatically - let the calling component decide
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine transaction type
  const getTransactionType = (tx) => {
    if (tx.tx?.type === 'SpendTx') return 'transfer';
    if (tx.tx?.type === 'ContractCallTx') return 'contract_interaction';
    if (tx.tx?.type === 'ContractCreateTx') return 'contract_deployment';
    return 'transfer';
  };

  // Helper function to get transaction amount
  const getTransactionAmount = (tx) => {
    if (tx.tx?.amount) {
      // Convert from aettos to AE (1 AE = 10^18 aettos)
      return (tx.tx.amount / Math.pow(10, 18)).toFixed(6);
    }
    return '0';
  };

  const value = {
    transactions,
    recentTransaction,
    loading,
    addTransaction,
    updateTransaction,
    getTransactionsByType,
    getRecentTransactions,
    clearTransactions,
    fetchBlockchainTransactions,
    setRecentTransaction
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
