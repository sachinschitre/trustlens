/**
 * Enhanced Contract Actions Component
 * Integrates with AeternityContractService and TransactionManager for robust transaction handling
 */

import React, { useState, useEffect } from 'react';
import { Send, AlertTriangle, RefreshCw, DollarSign, Brain, FileText, ExternalLink } from 'lucide-react';
import aiVerificationService from '../services/AIVerificationService';
import AeternityContractService from '../services/AeternityContractService';
import transactionManager from '../services/TransactionManager';
import { useTransactions } from '../contexts/TransactionContext';
import { useWallet } from '../contexts/WalletContext';
import VerificationResult from './VerificationResult';
import CONFIG from '../config/contract';
import toast from 'react-hot-toast';

const EnhancedContractActions = ({ wallet, onContractConnected }) => {
  const { account } = useWallet();
  const { addTransaction, updateTransaction, showTransactionConfirmation } = useTransactions();
  const [contractService] = useState(() => new AeternityContractService());
  const [projectDetails, setProjectDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // AI Verification states
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [deliverySummary, setDeliverySummary] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  // Initialize contract service
  useEffect(() => {
    const initializeService = async () => {
      if (wallet) {
        try {
          await contractService.initialize(wallet);
          await connectToContract();
        } catch (error) {
          console.error('Failed to initialize contract service:', error);
        }
      }
    };

    initializeService();
  }, [wallet]);

  // Set up transaction listeners
  useEffect(() => {
    const handleTransactionConfirmed = (transaction) => {
      console.log('Transaction confirmed:', transaction);
      loadProjectDetails();
      loadTransactionHistory();
    };

    const handleTransactionFailed = (transaction) => {
      console.log('Transaction failed:', transaction);
      loadTransactionHistory();
    };

    transactionManager.on('transactionConfirmed', handleTransactionConfirmed);
    transactionManager.on('transactionFailed', handleTransactionFailed);

    return () => {
      transactionManager.off('transactionConfirmed', handleTransactionConfirmed);
      transactionManager.off('transactionFailed', handleTransactionFailed);
    };
  }, []);

  // Load transaction history on mount
  useEffect(() => {
    if (isConnected) {
      loadTransactionHistory();
    }
  }, [isConnected]);

  const connectToContract = async () => {
    try {
      setIsLoading(true);
      await contractService.connectToContract();
      setIsConnected(true);
      await loadProjectDetails();
      await loadTransactionHistory();
      
      // Notify parent component that enhanced mode is ready
      if (onContractConnected) {
        onContractConnected();
      }
    } catch (error) {
      console.error('Error connecting to contract:', error);
      toast.error('Failed to connect to contract');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectDetails = async () => {
    try {
      const details = await contractService.getProjectDetails();
      setProjectDetails(details);
    } catch (error) {
      console.error('Error loading project details:', error);
    }
  };

  const loadTransactionHistory = async () => {
    try {
      // Get transaction history from transaction manager
      const confirmedHistory = transactionManager.getConfirmedTransactions();
      setTransactionHistory(confirmedHistory);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  };

  const handleAction = async (action, ...args) => {
    if (!isConnected) {
      toast.error('Contract not connected');
      return;
    }

    setIsLoading(true);
    let txHash = null;

    try {
      let result;
      let transactionOptions = {};

      // Generate mock transaction hash immediately
      txHash = `th_${action}_${Date.now().toString(36)}`;

      // Start transaction tracking immediately
      await transactionManager.startTransaction(action, txHash, transactionOptions);

      switch (action) {
        case 'deposit':
          if (!depositAmount || parseFloat(depositAmount) <= 0) {
            toast.error('Please enter a valid deposit amount');
            return;
          }
          transactionOptions = { amount: `${depositAmount} AE` };
          
          // Create transaction in shared context
          const depositTx = addTransaction({
            type: 'deposit',
            txHash: txHash,
            amount: depositAmount,
            from: account?.address || 'Your Wallet',
            to: CONFIG.contractAddress,
            status: 'pending'
          });
          
          console.log('Created deposit transaction:', depositTx);
          
          // Simulate deposit processing
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          result = {
            txHash,
            status: 'success',
            gasUsed: 5000,
            gasPrice: 1000000000,
            amount: parseFloat(depositAmount),
            type: 'deposit'
          };

          // Update transaction with confirmation details
          updateTransaction(depositTx.id, {
            status: 'confirmed',
            blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
            gasUsed: result.gasUsed,
            gasPrice: result.gasPrice
          });
          
          // Show transaction confirmation modal
          showTransactionConfirmation({
            type: 'deposit',
            tx_hash: txHash,
            amount: `${depositAmount} AE`,
            timestamp: new Date().toISOString()
          });
          
          setDepositAmount('');
          break;

        case 'release':
          // Create transaction in shared context
          const releaseTx = addTransaction({
            type: 'release',
            txHash: txHash,
            amount: '0', // Release doesn't involve amount from user
            from: CONFIG.contractAddress,
            to: account?.address || 'Freelancer Wallet',
            status: 'pending'
          });
          
          // Simulate release processing
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          result = {
            txHash,
            status: 'success',
            gasUsed: 30000,
            gasPrice: 1000000000,
            type: 'release'
          };

          // Update transaction with confirmation details
          updateTransaction(releaseTx.id, {
            status: 'confirmed',
            blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
            gasUsed: result.gasUsed,
            gasPrice: result.gasPrice
          });
          
          // Show transaction confirmation modal
          showTransactionConfirmation({
            type: 'release',
            tx_hash: txHash,
            amount: 'Contract Release',
            timestamp: new Date().toISOString()
          });
          break;

        case 'dispute':
          if (!disputeReason.trim()) {
            toast.error('Please provide a reason for the dispute');
            return;
          }
          transactionOptions = { reason: disputeReason };
          
          // Simulate dispute processing
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update project details to show disputed
          if (projectDetails) {
            projectDetails.disputed = true;
          }
          
          // Create transaction in shared context
          const disputeTx = addTransaction({
            type: 'dispute',
            txHash: txHash,
            amount: '0', // Dispute doesn't involve amount
            from: account?.address || 'Your Wallet',
            to: CONFIG.contractAddress,
            status: 'pending'
          });

          result = {
            txHash,
            status: 'success',
            gasUsed: 20000,
            gasPrice: 1000000000,
            type: 'dispute',
            reason: disputeReason
          };

          // Update transaction with confirmation details
          updateTransaction(disputeTx.id, {
            status: 'confirmed',
            blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
            gasUsed: result.gasUsed,
            gasPrice: result.gasPrice
          });
          
          // Show transaction confirmation modal
          showTransactionConfirmation({
            type: 'dispute',
            tx_hash: txHash,
            amount: 'Dispute Filed',
            timestamp: new Date().toISOString()
          });
          
          setDisputeReason('');
          break;

        case 'refund':
          // Create transaction in shared context
          const refundTx = addTransaction({
            type: 'refund',
            txHash: txHash,
            amount: '0', // Refund amount determined by contract
            from: CONFIG.contractAddress,
            to: account?.address || 'Your Wallet',
            status: 'pending'
          });
          
          // Simulate refund processing
          await new Promise(resolve => setTimeout(resolve, 1100));
          
          // Update project details
          if (projectDetails) {
            projectDetails.disputed = false;
          }
          
          result = {
            txHash,
            status: 'success',
            gasUsed: 25000,
            gasPrice: 1000000000,
            type: 'refund'
          };

          // Update transaction with confirmation details
          updateTransaction(refundTx.id, {
            status: 'confirmed',
            blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
            gasUsed: result.gasUsed,
            gasPrice: result.gasPrice
          });
          
          // Show transaction confirmation modal
          showTransactionConfirmation({
            type: 'refund',
            tx_hash: txHash,
            amount: 'Refund Processed',
            timestamp: new Date().toISOString()
          });
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Simulate confirmation delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Confirm transaction
      await transactionManager.confirmTransaction(txHash, result);

      // Refresh project details
      await loadProjectDetails();
      await loadTransactionHistory();

    } catch (error) {
      console.error(`${action} error:`, error);
      
      if (txHash) {
        await transactionManager.failTransaction(txHash, error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // AI Verification functionality
  const handleVerifyDelivery = async () => {
    const validation = aiVerificationService.validateInput(taskDescription, deliverySummary);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      const result = await aiVerificationService.verifyTaskCompletion(
        taskDescription, 
        deliverySummary
      );

      const formattedResult = aiVerificationService.formatVerificationResult(result);
      setVerificationResult(formattedResult);

      if (formattedResult.recommendation === 'release') {
        toast.success(`Verification complete! Score: ${formattedResult.completionScore}/100 - Release recommended`);
      } else {
        toast.error(`Verification complete! Score: ${formattedResult.completionScore}/100 - Dispute recommended`);
      }

    } catch (error) {
      console.error('AI verification failed:', error);
      setVerificationError(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-enable release button based on AI recommendation or manual override
  const shouldEnableRelease = () => {
    // Always allow release if not disputed and we have project details
    if (!projectDetails?.disputed && projectDetails) {
      // If AI verification is available and recommends release, show as recommended
      if (verificationResult && verificationResult.recommendation === 'release' && verificationResult.completionScore >= 70) {
        return 'recommended';
      }
      // Otherwise allow manual release
      return 'manual';
    }
    return false;
  };

  if (!isConnected && !isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
        <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
          <RefreshCw className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect to Contract
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Initialize connection to the deployed TrustLens escrow contract
        </p>
        <button
          onClick={connectToContract}
          className="px-6 py-3 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Connect to Contract
        </button>
      </div>
    );
  }

  if (isLoading && !projectDetails) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to contract...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Status */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-primary-600" />
            Contract Status
          </h3>
        </div>
        <div className="p-6">
          {projectDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Contract Address</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono text-gray-900">
                    {contractService.formatAddress(contractService.getContractAddress())}
                  </p>
                  <a
                    href={contractService.getExplorerUrl(contractService.getContractAddress())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="View on Aeternity Explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Network</p>
                <p className="text-sm text-gray-900">{contractService.getNetworkInfo().name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-sm text-gray-900">{contractService.aettosToAE(projectDetails.amount)} AE</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  projectDetails.disputed 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {projectDetails.disputed ? 'Disputed' : 'Active'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading contract details...</p>
          )}
        </div>
      </div>

      {/* AI Verification */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Task Verification</h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Use AI to analyze task completion and get intelligent recommendations
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe the original task requirements and deliverables..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isVerifying}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Summary
              </label>
              <textarea
                value={deliverySummary}
                onChange={(e) => setDeliverySummary(e.target.value)}
                placeholder="Describe what was actually delivered or completed..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isVerifying}
              />
            </div>

            <button
              onClick={handleVerifyDelivery}
              disabled={isVerifying || !taskDescription.trim() || !deliverySummary.trim()}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  <span>Verify Delivery with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result */}
      <VerificationResult 
        result={verificationResult}
        isLoading={isVerifying}
        error={verificationError}
      />

      {/* Contract Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contract Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Deposit Funds
              </h4>
              <p className="text-sm text-gray-600">
                Deposit AE tokens into the escrow contract
              </p>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.0"
                step="0.001"
                min="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={() => handleAction('deposit')}
                disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Deposit Funds'}
              </button>
            </div>

            {/* Release */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Send className="h-5 w-5 mr-2 text-blue-600" />
                Release Funds
              </h4>
              <p className="text-sm text-gray-600">
                Release funds to freelancer (Client/Mediator only)
              </p>
              {shouldEnableRelease() === 'manual' && (
                <p className="text-xs text-blue-600">
                  💡 Use AI verification above to get intelligent release recommendations
                </p>
              )}
              {shouldEnableRelease() === 'recommended' && (
                <p className="text-xs text-green-600">
                  ✅ AI verification recommends releasing funds
                </p>
              )}
              <button
                onClick={() => handleAction('release')}
                disabled={isLoading || projectDetails?.disputed || !shouldEnableRelease()}
                className={`w-full px-4 py-2 text-white rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  shouldEnableRelease() === 'recommended'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : shouldEnableRelease() === 'manual'
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gray-400 hover:bg-gray-500 focus:ring-gray-500'
                }`}
              >
                {shouldEnableRelease() === 'recommended' 
                  ? '✅ Release to Freelancer (AI Recommended)' 
                  : shouldEnableRelease() === 'manual'
                  ? 'Release to Freelancer'
                  : 'Release to Freelancer (Disabled)'
                }
              </button>
            </div>

            {/* Dispute */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Raise Dispute
              </h4>
              <p className="text-sm text-gray-600">
                Raise a dispute if there are issues with delivery
              </p>
              <input
                type="text"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Reason for dispute..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={() => handleAction('dispute')}
                disabled={isLoading || !disputeReason.trim()}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Raise Dispute'}
              </button>
            </div>

            {/* Refund */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-purple-600" />
                Refund Funds
              </h4>
              <p className="text-sm text-gray-600">
                Refund disputed funds to client
              </p>
              <button
                onClick={() => handleAction('refund')}
                disabled={isLoading || !projectDetails?.disputed}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Refund to Client'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {transactionHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {transactionHistory.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      tx.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {tx.txHash ? `${tx.txHash.slice(0, 10)}...` : 'No hash available'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (tx.status || 'unknown') === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status || 'unknown'}
                    </span>
                    {tx.amount && (
                      <p className="text-xs text-gray-500 mt-1">{tx.amount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedContractActions;
