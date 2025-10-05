/**
 * AI Verifier Dashboard Component
 * AI-powered task verification and recommendation system
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useWallet } from '../../contexts/WalletContext';
import aiVerificationService from '../../services/AIVerificationService';
import VerificationResult from '../VerificationResult';
import toast from 'react-hot-toast';

export const AIVerifierDashboard = () => {
  const { isConnected } = useWallet();
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [deliverySummary, setDeliverySummary] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [aiServiceStatus, setAiServiceStatus] = useState(null);

  // Check AI service status on mount
  React.useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        const health = await aiVerificationService.checkHealth();
        setAiServiceStatus(health);
      } catch (error) {
        setAiServiceStatus({ status: 'unhealthy', error: error.message });
      }
    };
    checkServiceStatus();
  }, []);

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

      // Add to history
      const historyEntry = {
        id: Date.now(),
        taskDescription: taskDescription.substring(0, 100) + '...',
        deliverySummary: deliverySummary.substring(0, 100) + '...',
        result: formattedResult,
        timestamp: new Date().toLocaleString()
      };
      setVerificationHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10

      // Show success message with recommendation
      if (formattedResult.recommendation === 'release') {
        toast.success(`✅ Verification complete! Score: ${formattedResult.completionScore}/100 - Release recommended`);
      } else {
        toast.error(`❌ Verification complete! Score: ${formattedResult.completionScore}/100 - Dispute recommended`);
      }

    } catch (error) {
      console.error('AI verification failed:', error);
      setVerificationError(error.message || 'Verification failed. Please try again.');
      toast.error('AI verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClearForm = () => {
    setTaskDescription('');
    setDeliverySummary('');
    setVerificationResult(null);
    setVerificationError(null);
  };

  const handleUseExample = () => {
    setTaskDescription('Create a responsive landing page for a tech startup with hero section, features, and contact form. Use modern design principles and ensure mobile compatibility.');
    setDeliverySummary('Delivered a fully responsive landing page with modern gradient design, smooth animations, mobile-first approach, and integrated contact form with validation. Includes hero section with CTA, features grid, testimonials, and footer. Tested across all major browsers and devices.');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'unhealthy':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
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
          <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl">
            <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Task Verifier
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Intelligent analysis of task completion with AI-powered recommendations
            </p>
          </div>
        </div>

        {/* AI Service Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(aiServiceStatus?.status)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Service Status
                </h3>
                <p className={`text-sm ${getStatusColor(aiServiceStatus?.status)}`}>
                  {aiServiceStatus?.status === 'healthy' ? 'Ready for verification' : 
                   aiServiceStatus?.status === 'unhealthy' ? 'Service unavailable' : 'Checking...'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh Status
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Task Verification
                  </h2>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUseExample}
                    disabled={isVerifying}
                  >
                    Use Example
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearForm}
                    disabled={isVerifying}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Task Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original Task Description
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Describe the original task requirements, deliverables, and expectations..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition-colors"
                    disabled={isVerifying}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Be specific about requirements, quality standards, and deliverables
                  </p>
                </div>

                {/* Delivery Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What Was Delivered
                  </label>
                  <textarea
                    value={deliverySummary}
                    onChange={(e) => setDeliverySummary(e.target.value)}
                    placeholder="Describe what was actually delivered, completed, or implemented..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition-colors"
                    disabled={isVerifying}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Include details about quality, completeness, and any deviations
                  </p>
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyDelivery}
                  disabled={isVerifying || !taskDescription.trim() || !deliverySummary.trim() || aiServiceStatus?.status !== 'healthy'}
                  className="w-full"
                  size="lg"
                  icon={<Brain className="w-5 h-5" />}
                  loading={isVerifying}
                >
                  {isVerifying ? 'Analyzing with AI...' : 'Verify Task Completion'}
                </Button>

                {aiServiceStatus?.status !== 'healthy' && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ⚠️ AI service is currently unavailable. Please try again later.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Verification Result */}
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <VerificationResult 
                result={verificationResult}
                isLoading={isVerifying}
                error={verificationError}
              />
            </motion.div>
          )}
        </div>

        {/* Right Column - Stats & History */}
        <div className="space-y-6">
          {/* AI Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Statistics
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Verifications:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {verificationHistory.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Release Rate:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {verificationHistory.length > 0 
                      ? Math.round((verificationHistory.filter(h => h.result.recommendation === 'release').length / verificationHistory.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {verificationHistory.length > 0 
                      ? Math.round(verificationHistory.reduce((sum, h) => sum + h.result.completionScore, 0) / verificationHistory.length)
                      : 0}/100
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recent Verifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Verifications
                </h3>
              </div>
              {verificationHistory.length === 0 ? (
                <div className="text-center py-6">
                  <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No verifications yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {verificationHistory.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.timestamp}
                        </span>
                        <span className={`
                          text-xs px-2 py-1 rounded-full font-medium
                          ${entry.result.recommendation === 'release' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }
                        `}>
                          {entry.result.recommendation}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                        {entry.taskDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Score: {entry.result.completionScore}/100
                        </span>
                        {entry.result.recommendation === 'release' ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Wallet Connection Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Wallet Status
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected 
                  ? 'Wallet connected - Ready for escrow actions' 
                  : 'Connect wallet to enable escrow integration'
                }
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIVerifierDashboard;
