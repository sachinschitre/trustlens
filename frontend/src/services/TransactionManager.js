/**
 * Transaction Manager
 * Handles transaction lifecycle, loading states, and confirmations
 */

import toast from 'react-hot-toast';
import CONFIG from '../config/contract';

class TransactionManager {
  constructor() {
    this.pendingTransactions = new Map();
    this.confirmedTransactions = new Map();
    this.listeners = new Map();
  }

  /**
   * Start a new transaction
   */
  async startTransaction(type, txHash, options = {}) {
    const transaction = {
      id: txHash,
      type,
      txHash,
      status: 'pending',
      startTime: Date.now(),
      ...options
    };

    this.pendingTransactions.set(txHash, transaction);
    
    // Show loading toast
    const loadingToast = toast.loading(
      this.getLoadingMessage(type, transaction),
      { duration: Infinity }
    );

    transaction.loadingToast = loadingToast;
    
    // Emit event
    this.emit('transactionStarted', transaction);
    
    return transaction;
  }

  /**
   * Confirm a transaction
   */
  async confirmTransaction(txHash, result = {}) {
    const transaction = this.pendingTransactions.get(txHash);
    
    if (!transaction) {
      console.warn(`Transaction ${txHash} not found in pending transactions`);
      return;
    }

    // Update transaction status
    transaction.status = 'confirmed';
    transaction.confirmedAt = Date.now();
    transaction.duration = transaction.confirmedAt - transaction.startTime;
    transaction.result = result;

    // Move to confirmed
    this.confirmedTransactions.set(txHash, transaction);
    this.pendingTransactions.delete(txHash);

    // Dismiss loading toast
    if (transaction.loadingToast) {
      toast.dismiss(transaction.loadingToast);
    }

    // Show success toast
    toast.success(this.getSuccessMessage(transaction.type, transaction));

    // Emit event
    this.emit('transactionConfirmed', transaction);

    return transaction;
  }

  /**
   * Fail a transaction
   */
  async failTransaction(txHash, error) {
    const transaction = this.pendingTransactions.get(txHash);
    
    if (!transaction) {
      console.warn(`Transaction ${txHash} not found in pending transactions`);
      return;
    }

    // Update transaction status
    transaction.status = 'failed';
    transaction.failedAt = Date.now();
    transaction.duration = transaction.failedAt - transaction.startTime;
    transaction.error = error;

    // Move to confirmed with failed status
    this.confirmedTransactions.set(txHash, transaction);
    this.pendingTransactions.delete(txHash);

    // Dismiss loading toast
    if (transaction.loadingToast) {
      toast.dismiss(transaction.loadingToast);
    }

    // Show error toast
    toast.error(this.getErrorMessage(transaction.type, error));

    // Emit event
    this.emit('transactionFailed', transaction);

    return transaction;
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(txHash, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.failTransaction(txHash, new Error('Transaction timeout'));
        reject(new Error('Transaction timeout'));
      }, timeout);

      // Listen for confirmation
      const listener = (confirmedTx) => {
        if (confirmedTx.txHash === txHash) {
          clearTimeout(timeoutId);
          this.off('transactionConfirmed', listener);
          resolve(confirmedTx);
        }
      };

      this.on('transactionConfirmed', listener);
    });
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions() {
    return Array.from(this.pendingTransactions.values());
  }

  /**
   * Get confirmed transactions
   */
  getConfirmedTransactions() {
    return Array.from(this.confirmedTransactions.values());
  }

  /**
   * Get transaction by hash
   */
  getTransaction(txHash) {
    return this.pendingTransactions.get(txHash) || 
           this.confirmedTransactions.get(txHash);
  }

  /**
   * Check if transaction is pending
   */
  isPending(txHash) {
    return this.pendingTransactions.has(txHash);
  }

  /**
   * Check if transaction is confirmed
   */
  isConfirmed(txHash) {
    return this.confirmedTransactions.has(txHash);
  }

  /**
   * Clear old transactions
   */
  clearOldTransactions(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const now = Date.now();
    const toDelete = [];

    for (const [txHash, transaction] of this.confirmedTransactions) {
      const age = now - (transaction.confirmedAt || transaction.failedAt || transaction.startTime);
      if (age > maxAge) {
        toDelete.push(txHash);
      }
    }

    toDelete.forEach(txHash => {
      this.confirmedTransactions.delete(txHash);
    });

    return toDelete.length;
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Message helpers
  getLoadingMessage(type, transaction) {
    const messages = {
      deposit: `Depositing ${transaction.amount || 'funds'} to escrow...`,
      release: 'Releasing funds to freelancer...',
      dispute: `Raising dispute: ${transaction.reason || 'Issue with delivery'}...`,
      refund: 'Refunding disputed funds to client...'
    };
    return messages[type] || 'Processing transaction...';
  }

  getSuccessMessage(type, transaction) {
    const messages = {
      deposit: `✅ Deposit successful! ${transaction.amount ? `(${transaction.amount} AE)` : ''}`,
      release: '✅ Funds released to freelancer!',
      dispute: '⚠️ Dispute raised successfully',
      refund: '✅ Funds refunded to client!'
    };
    return messages[type] || 'Transaction confirmed!';
  }

  getErrorMessage(type, error) {
    const baseMessages = {
      deposit: '❌ Deposit failed',
      release: '❌ Release failed',
      dispute: '❌ Dispute failed',
      refund: '❌ Refund failed'
    };
    const baseMessage = baseMessages[type] || '❌ Transaction failed';
    return `${baseMessage}: ${error.message || error}`;
  }

  // Utility methods
  getExplorerUrl(txHash) {
    return CONFIG.getExplorerUrl('tx', txHash);
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  getTransactionStatus(txHash) {
    if (this.isPending(txHash)) return 'pending';
    if (this.isConfirmed(txHash)) {
      const tx = this.getTransaction(txHash);
      return tx?.status === 'failed' ? 'failed' : 'confirmed';
    }
    return 'unknown';
  }
}

// Create singleton instance
const transactionManager = new TransactionManager();

export default transactionManager;
