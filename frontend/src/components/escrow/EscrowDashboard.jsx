/**
 * Escrow Dashboard Component
 * Complete escrow management with wallet connection and contract interactions
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Wallet, FileText, DollarSign, Clock, AlertTriangle, CheckCircle, Plus, Send, Flag, RotateCcw, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useWallet } from '../../contexts/WalletContext';
import { useTransactions } from '../../contexts/TransactionContext';
import WalletConnection from '../WalletConnection';
import ContractForm from '../ContractForm';
import ContractActions from '../ContractActions';
import EnhancedContractActions from '../EnhancedContractActions';
import CONFIG from '../../config/contract';
import toast from 'react-hot-toast';

export const EscrowDashboard = ({ readOnly = false }) => {
  const { isConnected } = useWallet();
  const { addTransaction, updateTransaction, getRecentTransactions, recentTransaction } = useTransactions();
  const [contractService, setContractService] = useState(null);
  const [step, setStep] = useState(1); // 1: Connect Wallet, 2: Choose Contract, 3: Interact
  const [useEnhancedActions, setUseEnhancedActions] = useState(true);

  const handleContractConnected = (service, deployResult = null) => {
    // Only set contractService for basic mode
    if (!useEnhancedActions) {
      setContractService(service);
    }
    
    if (deployResult) {
      const tx = addTransaction({
        type: 'contract_deployment',
        txHash: deployResult.txHash,
        amount: '0',
        from: 'Your Wallet',
        to: 'New Contract',
        status: 'confirmed'
      });
    }
    setStep(3);
  };

  // Auto-advance steps when wallet connects
  useEffect(() => {
    if (isConnected && step === 1) {
      setStep(2);
    }
  }, [isConnected, step]);

  // Determine current step based on connection status
  const getCurrentStep = () => {
    if (!isConnected) return 1;
    if (isConnected && step === 1) return 2;
    if (isConnected && step === 2) return 2;
    if (isConnected && step === 3) return 3;
    return step;
  };

  const currentStep = getCurrentStep();

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Connect Your Wallet';
      case 2:
        return 'Choose or Deploy Contract';
      case 3:
        return 'Manage Your Escrow';
      default:
        return 'Escrow Management';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Connect your Superhero Wallet to start managing escrows';
      case 2:
        return 'Connect to an existing escrow contract or deploy a new one';
      case 3:
        return 'Interact with your escrow contract using the tools below';
      default:
        return 'Manage your escrow transactions and view recent activity';
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <Wallet className="w-8 h-8 text-blue-600" />;
      case 2:
        return <FileText className="w-8 h-8 text-green-600" />;
      case 3:
        return <Shield className="w-8 h-8 text-purple-600" />;
      default:
        return <DollarSign className="w-8 h-8 text-green-600" />;
    }
  };

  const getStepColor = () => {
    switch (currentStep) {
      case 1:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 2:
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 3:
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {readOnly ? 'My Escrow Contracts' : 'Escrow Dashboard'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {readOnly 
                ? 'View your escrow contracts and track their status' 
                : 'Manage your smart contract escrows with AI-powered verification'
              }
            </p>
            {readOnly && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <Eye className="w-4 h-4 mr-1" />
                Read-only mode
              </div>
            )}
          </div>
          <div className={`p-4 rounded-2xl border-2 ${getStepColor()}`}>
            {getStepIcon()}
          </div>
        </div>
      </motion.div>

      {/* Step Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= stepNumber
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {currentStep > stepNumber ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
              ))}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getStepTitle()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getStepDescription()}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Wallet Connection */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="flex items-center space-x-3 mb-6">
                  <Wallet className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Connect Your Wallet
                  </h3>
                </div>
                <WalletConnection />
              </Card>
            </motion.div>
          )}

          {/* Step 2: Contract Selection */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {readOnly ? 'Contract Information' : 'Choose or Deploy Contract'}
                  </h3>
                </div>
                
                {readOnly ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      View Contract Details
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      View information about your escrow contracts.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Default Contract:</h5>
                      <p className="font-mono text-sm text-gray-600 dark:text-gray-400 break-all">
                        {CONFIG.contract.address}
                      </p>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2 mt-4">Network:</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {CONFIG.contract.network}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => setUseEnhancedActions(true)}
                        variant={useEnhancedActions ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        Enhanced Mode
                      </Button>
                      <Button
                        onClick={() => setUseEnhancedActions(false)}
                        variant={!useEnhancedActions ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        Basic Mode
                      </Button>
                    </div>
                    
                    <ContractForm onContractConnected={handleContractConnected} />
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Step 3: Contract Actions */}
          {currentStep >= 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {readOnly ? 'Contract View' : 'Contract Actions'}
                  </h3>
                </div>
                
                {readOnly ? (
                  <div className="text-center py-8">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      View-Only Mode
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You can view contract information but cannot perform actions.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Contract Address:</h5>
                      <p className="font-mono text-sm text-gray-600 dark:text-gray-400 break-all">
                        {CONFIG.contract.address}
                      </p>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2 mt-4">Network:</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {CONFIG.contract.network}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {useEnhancedActions ? (
                      <EnhancedContractActions />
                    ) : (
                      <ContractActions contractService={contractService} />
                    )}
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          {/* Contract Info */}
          {currentStep >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contract Info
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contract Address</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {CONFIG.contractAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Network</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {CONFIG.network.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mode</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {useEnhancedActions ? 'Enhanced' : 'Basic'}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {currentStep >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Escrow Amount</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">1.0 AE</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">7 days</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Active</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {currentStep >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.hash = '#ledger'}
                icon={<Eye className="w-4 h-4" />}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {getRecentTransactions(3).length > 0 ? (
                getRecentTransactions(3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'deposit' ? 'bg-green-100 dark:bg-green-900/20' :
                        tx.type === 'release' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        tx.type === 'dispute' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-gray-100 dark:bg-gray-700/20'
                      }`}>
                        {tx.type === 'deposit' && <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        {tx.type === 'release' && <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {tx.type === 'dispute' && <Flag className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                        {tx.type === 'refund' && <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {tx.type} - {tx.amount} AE
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400'
                      }`}>
                        {tx.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const explorerUrl = `https://aescan.io/transactions/${tx.txHash}`;
                          window.open(explorerUrl, '_blank');
                        }}
                        icon={<Eye className="w-3 h-3" />}
                        title="View on Explorer"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your escrow transactions will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default EscrowDashboard;