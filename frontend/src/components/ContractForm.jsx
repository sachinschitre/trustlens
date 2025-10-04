import React, { useState } from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ContractService from '../services/ContractService';

const ContractForm = ({ onContractConnected }) => {
  const { wallet, isConnected } = useWallet();
  const [contractService] = useState(() => new ContractService(wallet));
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState('ct_mgcu3hf44v523o840mx'); // Mock contract address
  const [isDeployMode, setIsDeployMode] = useState(false);
  
  // Deploy form fields
  const [clientAddress, setClientAddress] = useState('');
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [mediatorAddress, setMediatorAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleConnectToExisting = async (e) => {
    e.preventDefault();
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const contract = await contractService.ConnectToContract(contractAddress);
      onContractConnected(contractService);
    } catch (error) {
      console.error('Error connecting to contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployNew = async (e) => {
    e.preventDefault();
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const params = {
        client: clientAddress,
        freelancer: freelancerAddress,
        mediator: mediatorAddress,
        amount: parseFloat(amount) * 1e18, // Convert to aettos
        deadline: Math.floor(new Date(deadline).getTime() / 1000) // Convert to unix timestamp
      };

      const deployResult = await contractService.deployContract(params);
      onContractConnected(contractService, deployResult);
    } catch (error) {
      console.error('Error deploying contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
        <p className="text-gray-600">Please connect your wallet first</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Contract Interaction
          </h3>
        </div>
        
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setIsDeployMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isDeployMode 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Connect Existing
          </button>
          <button
            onClick={() => setIsDeployMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDeployMode 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Deploy New
          </button>
        </div>
      </div>

      <div className="p-6">
        {!isDeployMode ? (
          <form onSubmit={handleConnectToExisting} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Address
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="ct_...."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div className="space-y-2">
              <button
                type="submit"
                disabled={isLoading || !contractAddress}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Connecting...' : 'Connect to Contract'}
              </button>
              
              {/* Quick Connect to Mock Contract */}
              {contractAddress === 'ct_mgcu3hf44v523o840mx' && (
                <button
                  type="button"
                  onClick={handleConnectToExisting}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  🚀 Quick Connect to Demo Contract
                </button>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleDeployNew} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Address
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="ak_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Freelancer Address
                </label>
                <input
                  type="text"
                  value={freelancerAddress}
                  onChange={(e) => setFreelancerAddress(e.target.value)}
                  placeholder="ak_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mediator Address
                </label>
                <input
                  type="text"
                  value={mediatorAddress}
                  onChange={(e) => setMediatorAddress(e.target.value)}
                  placeholder="ak_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (AE)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Deploying...' : 'Deploy Contract'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContractForm;
