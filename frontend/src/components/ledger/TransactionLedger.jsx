/**
 * Transaction Ledger Component
 * Blockchain transaction history and explorer integration
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  ExternalLink, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Copy,
  Calendar,
  Hash,
  Plus
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useWallet } from '../../contexts/WalletContext';
import { useTransactions } from '../../contexts/TransactionContext';
import toast from 'react-hot-toast';

export const TransactionLedger = () => {
  const { account, isConnected } = useWallet();
  const { transactions, loading, fetchBlockchainTransactions, getRecentTransactions } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Empty transactions array - will only show transactions from connected wallet
  const mockTransactions = [];

  useEffect(() => {
    if (isConnected && account?.address) {
      fetchTransactions(false); // Don't show toasts on automatic fetch
    }
  }, [isConnected, account]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const addSampleTransactions = () => {
    // Generate unique transaction hashes for testing
    const generateTxHash = (prefix) => {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let hash = prefix;
      for (let i = 0; i < 50; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return hash;
    };

    const sampleTransactions = [
      {
        id: 'sample_1',
        txHash: generateTxHash('th_'),
        type: 'deposit',
        amount: '1.5',
        from: 'ak_56zkWKSQ6nGXfy3fPaSBz65YPN93GX13biFWS2H3k26s1Vube',
        to: 'ct_mgcu3hf44v523o840mx',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        gasUsed: 21000,
        gasPrice: 1000000000,
        blockNumber: 1234567,
        confirmations: 15,
        source: 'sample'
      },
      {
        id: 'sample_2',
        txHash: generateTxHash('th_'),
        type: 'release',
        amount: '1.0',
        from: 'ct_mgcu3hf44v523o840mx',
        to: 'ak_56zkWKSQ6nGXfy3fPaSBz65YPN93GX13biFWS2H3k26s1Vube',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        gasUsed: 25000,
        gasPrice: 1200000000,
        blockNumber: 1234568,
        confirmations: 8,
        source: 'sample'
      },
      {
        id: 'sample_3',
        txHash: generateTxHash('th_'),
        type: 'dispute',
        amount: '0.0',
        from: 'ak_56zkWKSQ6nGXfy3fPaSBz65YPN93GX13biFWS2H3k26s1Vube',
        to: 'ct_mgcu3hf44v523o840mx',
        status: 'pending',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        gasUsed: 18000,
        gasPrice: 900000000,
        blockNumber: null,
        confirmations: 0,
        source: 'sample'
      }
    ];

    // Add sample transactions to the shared context
    sampleTransactions.forEach(tx => {
      addTransaction(tx);
    });

    toast.success('Added sample transactions for testing');
  };

  const fetchTransactions = async (showToasts = false) => {
    if (!account?.address) {
      return;
    }

    try {
      const blockchainTransactions = await fetchBlockchainTransactions(account.address);
      if (showToasts) {
        if (blockchainTransactions.length > 0) {
          toast.success(`Loaded ${blockchainTransactions.length} blockchain transactions`);
        } else {
          toast.info('No transactions found for your wallet address');
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (showToasts) {
        toast.error('Unable to fetch transactions. Please check your connection and try again.');
      }
    }
  };


  const filterTransactions = () => {
    console.log('Filtering transactions:', transactions);
    let filtered = [...transactions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.escrowId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'gas':
          aValue = a.gasUsed;
          bValue = b.gasUsed;
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    console.log('Final filtered transactions:', filtered);
    setFilteredTransactions(filtered);
  };

  const handleCopyTxHash = (txHash) => {
    navigator.clipboard.writeText(txHash);
    toast.success('Transaction hash copied to clipboard');
  };

  const handleViewOnExplorer = (txHash) => {
    const explorerUrl = `https://aescan.io/transactions/${txHash}`;
    window.open(explorerUrl, '_blank');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'release': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'dispute': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'refund': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Transaction Hash', 'Type', 'Amount (AE)', 'From', 'To', 'Status', 'Date', 'Gas Used', 'Block Number'],
      ...filteredTransactions.map(tx => [
        tx.txHash,
        tx.type,
        tx.amount,
        tx.from,
        tx.to,
        tx.status,
        formatDate(tx.timestamp),
        tx.gasUsed,
        tx.blockNumber || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Transaction Ledger
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your blockchain transaction history
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => fetchTransactions(true)}
              disabled={loading}
              icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={addSampleTransactions}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Sample Data
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                console.log('Current transactions in context:', transactions);
                console.log('Current filtered transactions:', filteredTransactions);
              }}
              icon={<Eye className="w-4 h-4" />}
            >
              Debug
            </Button>
            <Button
              variant="outline"
              onClick={exportTransactions}
              disabled={filteredTransactions.length === 0}
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Transactions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by hash, address, or escrow ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="release">Release</option>
                <option value="dispute">Dispute</option>
                <option value="refund">Refund</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="gas">Gas Used</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Transaction</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">From/To</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {!isConnected ? (
                        <div>
                          <p className="text-lg font-medium mb-2">Connect your wallet to view transactions</p>
                          <p className="text-sm">Please connect your Superhero Wallet to see your transaction history</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium mb-2">No transactions found</p>
                          <p className="text-sm">No transactions found for your wallet address</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <button
                            onClick={() => handleViewOnExplorer(tx.txHash)}
                            className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                            title="Click to view on Aeternity Explorer"
                          >
                            {formatAddress(tx.txHash)}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(tx.type)}
                          <span className="capitalize text-gray-900 dark:text-white">
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {tx.amount} AE
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            From: {formatAddress(tx.from)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            To: {formatAddress(tx.to)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(tx.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        {tx.blockNumber && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Block: 
                            <button
                              onClick={() => {
                                const blockExplorerUrl = `https://aescan.io/blocks/${tx.blockNumber}`;
                                window.open(blockExplorerUrl, '_blank');
                              }}
                              className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                              title="Click to view block on Aeternity Explorer"
                            >
                              {tx.blockNumber}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(tx.timestamp)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {tx.confirmations} confirmations
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyTxHash(tx.txHash)}
                            icon={<Copy className="w-3 h-3" />}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewOnExplorer(tx.txHash)}
                            icon={<ExternalLink className="w-3 h-3" />}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default TransactionLedger;
