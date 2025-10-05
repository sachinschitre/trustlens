/**
 * Escrow Dashboard Component
 * Complete escrow management with wallet connection and contract interactions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Wallet, FileText, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useWallet } from '../../contexts/WalletContext';
import WalletConnection from '../WalletConnection';
import ContractForm from '../ContractForm';
import ContractActions from '../ContractActions';
import EnhancedContractActions from '../EnhancedContractActions';
import TransactionStatus from '../TransactionStatus';
import CONFIG from '../../config/contract';
import toast from 'react-hot-toast';

export const EscrowDashboard = () => {
  const { isConnected } = useWallet();
  const [contractService, setContractService] = useState(null);
  const [recentTransaction, setRecentTransaction] = useState(null);
  const [step, setStep] = useState(1); // 1: Connect Wallet, 2: Choose Contract, 3: Interact
  const [useEnhancedActions, setUseEnhancedActions] = useState(true);

  // Auto-advance steps based on wallet connection
  React.useEffect(() => {
    if (isConnected && step === 1) {
      setStep(2);
    }
  }, [isConnected, step]);

  const handleContractConnected = (service, deployResult = null) => {
    // Only set contractService for basic mode
    if (!useEnhancedActions) {
      setContractService(service);
    }
    
    if (deployResult) {
      setRecentTransaction({
        txHash: deployResult.txHash,
        status: 'success',
        gasUsed: deployResult.gasUsed
      });
    }
    setStep(3);
  };

  const handleTransactionComplete = (txResult) => {
    setRecentTransaction(txResult);
  };

  const handleNewContract = () => {
    setContractService(null);
    setRecentTransaction(null);
    setStep(2);
  };

  const handleEnhancedModeReady = () => {
    // Enhanced mode is ready, advance to step 3
    setStep(3);
  };

  // Auto-advance to step 3 if wallet is connected and we're using enhanced mode
  React.useEffect(() => {
    if (isConnected && useEnhancedActions && step === 2) {
      setStep(3);
    }
  }, [isConnected, useEnhancedActions, step]);

  const getStepTitle = () => {
    switch (step) {
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
    switch (step) {
      case 1:
        return 'Connect your Superhero Wallet to start managing escrows';
      case 2:
        return 'Connect to an existing escrow contract or deploy a new one';
      case 3:
        return 'Deposit funds, release payments, or raise disputes';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getStepTitle()}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {getStepDescription()}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}>
                {step > stepNumber ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wallet & Contract Setup */}
        <div className="lg:col-span-1 space-y-6">
          {/* Wallet Connection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <WalletConnection onWalletConnected={() => setStep(2)} />
          </motion.div>

          {/* Contract Form (Step 2) */}
          {step >= 2 && !useEnhancedActions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ContractForm onContractConnected={handleContractConnected} />
            </motion.div>
          )}

          {/* Contract Info */}
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contract Details
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Network:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {CONFIG.contract.network}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Contract:</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                      {CONFIG.contract.address.slice(0, 10)}...
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewContract}
                    className="w-full"
                  >
                    Switch Contract
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Contract Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Actions */}
          {step >= 3 && (
            <>
              {useEnhancedActions ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <EnhancedContractActions 
                    wallet={contractService?.wallet}
                    onContractConnected={handleEnhancedModeReady}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <ContractActions 
                    contractService={contractService} 
                    onTransactionComplete={handleTransactionComplete}
                  />
                </motion.div>
              )}
            </>
          )}

          {/* Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Interface Mode
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {useEnhancedActions 
                      ? 'Enhanced mode with AI verification and advanced features' 
                      : 'Basic mode with simple contract interactions'
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setUseEnhancedActions(!useEnhancedActions)}
                  disabled={!isConnected}
                >
                  {useEnhancedActions ? 'Switch to Basic' : 'Switch to Enhanced'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Transaction Status */}
          {recentTransaction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <TransactionStatus {...recentTransaction} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {step >= 3 && (
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
    </div>
  );
};

export default EscrowDashboard;
