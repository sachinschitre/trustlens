/**
 * TrustLens - AI-Powered Escrow Platform
 * Modern, professional dApp with dark/light mode and glassmorphism design
 */

import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './contexts/WalletContext';
import { SolanaWalletProvider } from './contexts/SolanaWalletContext';
import { ThemeProvider } from './theme/ThemeProvider';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './components/dashboard/DashboardOverview';
import Footer from './components/layout/Footer';
import WalletConnection from './components/WalletConnection';
import ContractForm from './components/ContractForm';
import ContractActions from './components/ContractActions';
import EnhancedContractActions from './components/EnhancedContractActions';
import TransactionStatus from './components/TransactionStatus';
import SolanaNftViewer from './components/SolanaNftViewer';
import { FileText, BarChart3, Settings, Shield, Brain, ImageIcon } from 'lucide-react';
import CONFIG from './config/contract';
import './App.css';

function App() {
  const [contractService, setContractService] = useState(null);
  const [recentTransaction, setRecentTransaction] = useState(null);
  const [step, setStep] = useState(1); // 1: Connect Wallet, 2: Choose Contract, 3: Interact
  const [activeTab, setActiveTab] = useState('escrow'); // 'escrow' or 'nfts'
  const [useEnhancedActions, setUseEnhancedActions] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'escrow', 'ai', 'nfts', 'settings'

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

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    // Reset step when navigating to escrow
    if (viewId === 'escrow') {
      setStep(1);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview />;
      
      case 'escrow':
        return (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Escrow Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Create, manage, and monitor secure escrow contracts powered by AI verification
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-8 mb-8">
              {[
                { id: 1, label: 'Connect Wallet', icon: '🔗' },
                { id: 2, label: 'Choose Contract', icon: '📋' },
                { id: 3, label: 'Interact', icon: '⚡' },
              ].map((stepItem) => (
                <div
                  key={stepItem.id}
                  className={`flex items-center space-x-3 ${
                    step >= stepItem.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepItem.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {step >= stepItem.id ? stepItem.icon : stepItem.id}
                  </div>
                  <span className="text-sm font-medium">{stepItem.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                <WalletConnection onWalletConnected={() => setStep(2)} />
                {step >= 2 && !useEnhancedActions && (
                  <ContractForm onContractConnected={handleContractConnected} />
                )}
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contract Actions */}
                {useEnhancedActions ? (
                  <EnhancedContractActions 
                    wallet={contractService?.wallet}
                    onContractConnected={handleEnhancedModeReady}
                  />
                ) : (
                  <ContractForm onContractConnected={handleContractConnected} />
                )}

                {/* Basic Mode Contract Actions */}
                {!useEnhancedActions && contractService && (
                  <ContractActions 
                    contractService={contractService} 
                    onTransactionComplete={handleTransactionComplete}
                  />
                )}
                
                {/* Toggle Button */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Contract Integration Mode
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {useEnhancedActions 
                          ? 'Enhanced mode with transaction manager and config integration' 
                          : 'Basic mode with original contract service'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => setUseEnhancedActions(!useEnhancedActions)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        useEnhancedActions 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {useEnhancedActions ? 'Enhanced Mode' : 'Basic Mode'}
                    </button>
                  </div>
                </div>

                {/* Recent Transaction Status */}
                {recentTransaction && (
                  <TransactionStatus {...recentTransaction} />
                )}

                {/* Welcome Message */}
                {step < 2 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                    <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full w-fit mx-auto mb-6">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Welcome to TrustLens
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      A secure cross-chain escrow platform powered by Aeternity and Solana blockchains.
                      Connect your wallet to get started.
                    </p>
                    
                    {/* Deployed Contract Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-left">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Deployed Contract</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Address:</span>
                          <span className="font-mono text-gray-900 dark:text-white">{CONFIG.contract.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Network:</span>
                          <span className="text-gray-900 dark:text-white">{CONFIG.contract.network}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Status:</span>
                          <span className="text-green-600 dark:text-green-400">✅ Deployed</span>
                        </div>
                      </div>
                    </div>
                    
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                      <li className="flex items-center justify-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Secure fund deposits</span>
                      </li>
                      <li className="flex items-center justify-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>AI-powered verification</span>
                      </li>
                      <li className="flex items-center justify-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>NFT receipt tracking</span>
                      </li>
                      <li className="flex items-center justify-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Cross-chain synchronization</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              AI Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              AI-powered task verification coming soon...
            </p>
          </div>
        );

      case 'nfts':
        return <SolanaNftViewer />;

      case 'settings':
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Application settings coming soon...
            </p>
          </div>
        );

      default:
        return <DashboardOverview />;
    }
  };

  return (
    <ThemeProvider>
      <WalletProvider>
        <SolanaWalletProvider>
          <DashboardLayout>
            {renderContent()}
            <Footer />
          </DashboardLayout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
            }}
          />
        </SolanaWalletProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;