import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './contexts/WalletContext';
import WalletConnection from './components/WalletConnection';
import ContractForm from './components/ContractForm';
import ContractActions from './components/ContractActions';
import TransactionStatus from './components/TransactionStatus';
import './App.css';

function App() {
  const [contractService, setContractService] = useState(null);
  const [recentTransaction, setRecentTransaction] = useState(null);
  const [step, setStep] = useState(1); // 1: Connect Wallet, 2: Choose Contract, 3: Interact

  const handleContractConnected = (service, deployResult = null) => {
    setContractService(service);
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

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#10b981',
                secondary: '#000',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#ef4444',
                secondary: '#000',
              },
            },
          }}
        />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <span className="text-white font-bold text-sm">TL</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">TrustLens</h1>
                  <p className="text-sm text-gray-500">Escrow Contract Interface</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">Aeternity • Sophia Contract</span>
                {contractService && (
                  <button
                    onClick={handleNewContract}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    New Contract
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center space-x-2 ${
                step >= 1 ? 'text-primary-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="font-medium">Connect Wallet</span>
              </div>
              <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${
                step >= 2 ? 'text-primary-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="font-medium">Choose Contract</span>
              </div>
              <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${
                step >= 3 ? 'text-primary-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="font-medium">Interact</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <WalletConnection />

              {/* Contract Selection */}
              {step >= 2 && (
                <ContractForm onContractConnected={handleContractConnected} />
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contract Actions */}
              {contractService && (
                <ContractActions 
                  contractService={contractService} 
                  onTransactionComplete={handleTransactionComplete}
                />
              )}

              {/* Recent Transaction Status */}
              {recentTransaction && (
                <TransactionStatus {...recentTransaction} />
              )}

              {/* Welcome Message */}
              {!contractService && step < 2 && (
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-6">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to TrustLens
                  </h2>
                  <p className="text-gray-600 mb-6">
                    A secure escrow platform powered by Superhero Wallet and Aeternity blockchain.
                    Connect your wallet to get started.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center justify-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Secure fund deposits</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Automated fund release</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Dispute resolution</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Transparent transactions</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-gray-500">
              <p>Built on Aeternity blockchain • Powered by Superhero Wallet</p>
              <p className="mt-2">
                <a 
                  href="https://github.com/aeternity" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  GitHub
                </a>
                <span className="mx-2">•</span>
                <a 
                  href="https://docs.aeternity.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Documentation
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
}

export default App;
