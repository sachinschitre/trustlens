import React, { useState, useEffect } from 'react';
import { Send, AlertTriangle, RefreshCw, DollarSign, Brain, FileText } from 'lucide-react';
import aiVerificationService from '../services/AIVerificationService';
import VerificationResult from './VerificationResult';
import toast from 'react-hot-toast';

const ContractActions = ({ contractService }) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  
  // AI Verification states
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [deliverySummary, setDeliverySummary] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  useEffect(() => {
    if (contractService?.isContractConnected()) {
      loadProjectDetails();
    }
  }, [contractService]);

  const loadProjectDetails = async () => {
    if (!contractService) return;
    
    try {
      const details = await contractService.getProjectDetails();
      setProjectDetails(details);
    } catch (error) {
      console.error('Error loading project details:', error);
    }
  };

  const handleAction = async (action, ...args) => {
    setIsLoading(true);
    try {
      let result;
      switch (action) {
        case 'deposit':
          result = await contractService.deposit(parseFloat(depositAmount) * 1e18);
          setDepositAmount('');
          break;
        case 'release':
          result = await contractService.release();
          break;
        case 'dispute':
          result = await contractService.dispute(disputeReason);
          setDisputeReason('');
          break;
        case 'refund':
          result = await contractService.refund();
          break;
        default:
          throw new Error('Unknown action');
      }

      // Add transaction to history
      setTransactionHistory(prev => [result, ...prev.slice(0, 9)]);

      // Refresh project details
      await loadProjectDetails();
    } catch (error) {
      console.error(`${action} failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // AI Verification functionality
  const handleVerifyDelivery = async () => {
    // Validate inputs
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

      // Show success message with recommendation
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

  // Auto-enable release button based on AI recommendation
  const shouldEnableRelease = () => {
    if (!verificationResult) return false;
    return verificationResult.recommendation === 'release' && 
           verificationResult.completionScore >= 70 &&
           !projectDetails?.disputed;
  };

  if (!projectDetails) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Details */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
            <button
              onClick={loadProjectDetails}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Client</label>
              <p className="text-sm font-mono text-gray-900">{projectDetails.client.slice(0, 10)}...</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Freelancer</label>
              <p className="text-sm font-mono text-gray-900">{projectDetails.freelancer.slice(0, 10)}...</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mediator</label>
              <p className="text-sm font-mono text-gray-900">{projectDetails.mediator.slice(0, 10)}...</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Amount</label>
              <p className="text-lg font-semibold text-gray-900">
                {(projectDetails.amount / 1e18).toFixed(4)} AE
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Deadline</label>
              <p className="text-sm text-gray-900">
                {new Date(projectDetails.deadline * 1000).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${projectDetails.disputed 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
                }
              `}>
                {projectDetails.disputed ? 'Disputed' : 'Active'}
              </span>
            </div>
          </div>
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
            {/* Task Description */}
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

            {/* Delivery Summary */}
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

            {/* Verify Button */}
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
              <input
                type="number"
                step="0.001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount in AE"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isLoading}
              />
              <button
                onClick={() => handleAction('deposit')}
                disabled={isLoading || !depositAmount}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Deposit
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
              <button
                onClick={() => handleAction('release')}
                disabled={isLoading || projectDetails.disputed}
                className={`w-full px-4 py-2 text-white rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  shouldEnableRelease() 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {shouldEnableRelease() ? '✅ Release to Freelancer (AI Recommended)' : 'Release to Freelancer'}
              </button>
            </div>

            {/* Dispute */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Raise Dispute
              </h4>
              <input
                type="text"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Reason for dispute"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isLoading || projectDetails.disputed}
              />
              <button
                onClick={() => handleAction('dispute')}
                disabled={isLoading || projectDetails.disputed || !disputeReason}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Raise Dispute
              </button>
            </div>

            {/* Refund */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-red-600" />
                Process Refund
              </h4>
              <p className="text-sm text-gray-600">
                Refund to client (Mediator only, disputed contracts)
              </p>
              <button
                onClick={() => handleAction('refund')}
                disabled={isLoading || !projectDetails.disputed}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {transactionHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {transactionHistory.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-mono text-gray-600">
                      {tx.txHash.slice(0, 10)}...
                    </p>
                  </div>
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${tx.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {tx.status}
                  </span>
                  {tx.gasUsed && (
                    <span className="text-xs text-gray-500">
                      Gas: {tx.gasUsed}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractActions;
