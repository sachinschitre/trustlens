/**
 * Transaction Confirmation Modal Component
 * Displays transaction details after successful transaction execution
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  X,
  Clock,
  Shield,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const TransactionConfirmationModal = ({ 
  isOpen, 
  onClose, 
  transaction = null 
}) => {
  if (!transaction) return null;

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return <DollarSign className="w-8 h-8 text-green-600" />;
      case 'release':
        return <Shield className="w-8 h-8 text-blue-600" />;
      case 'dispute':
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
      default:
        return <Clock className="w-8 h-8 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'release':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'dispute':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Transaction hash copied to clipboard!');
  };

  const handleViewOnExplorer = () => {
    const explorerUrl = `https://testnet.aescan.io/transactions/${transaction.tx_hash}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  const formatTransactionHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md"
          >
            <Card className="p-6 shadow-2xl border-0 bg-white dark:bg-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full border-2 ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Transaction Confirmed
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your transaction has been processed successfully
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4 mb-6">
                {/* Transaction Type */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Transaction Type
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {transaction.type || 'Unknown'}
                  </span>
                </div>

                {/* Transaction Hash */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Transaction Hash
                    </span>
                    <button
                      onClick={() => copyToClipboard(transaction.tx_hash)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Copy hash"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                      {formatTransactionHash(transaction.tx_hash)}
                    </code>
                  </div>
                </div>

                {/* Amount (if available) */}
                {transaction.amount && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Amount
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {transaction.amount}
                    </span>
                  </div>
                )}

                {/* Timestamp (if available) */}
                {transaction.timestamp && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Timestamp
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleViewOnExplorer}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Aeternity Testnet Explorer</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Close
                </Button>
              </div>

              {/* Success Indicator */}
              <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Transaction Successful</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionConfirmationModal;
