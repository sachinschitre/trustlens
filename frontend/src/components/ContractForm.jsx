import React, { useState } from 'react';
import { Plus, ExternalLink, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import ContractService from '../services/ContractService';
import toast from 'react-hot-toast';

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
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      toast.loading('Connecting to contract...', { id: 'connect' });
      const contract = await contractService.ConnectToContract(contractAddress);
      onContractConnected(contractService);
      toast.success('Successfully connected to contract!', { id: 'connect' });
    } catch (error) {
      console.error('Error connecting to contract:', error);
      toast.error('Failed to connect to contract', { id: 'connect' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployNew = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      toast.loading('Deploying contract...', { id: 'deploy' });
      const params = {
        client: clientAddress,
        freelancer: freelancerAddress,
        mediator: mediatorAddress,
        amount: parseFloat(amount) * 1e18, // Convert to aettos
        deadline: Math.floor(new Date(deadline).getTime() / 1000) // Convert to unix timestamp
      };

      const deployResult = await contractService.deployContract(params);
      onContractConnected(contractService, deployResult);
      toast.success('Contract deployed successfully!', { id: 'deploy' });
    } catch (error) {
      console.error('Error deploying contract:', error);
      toast.error('Failed to deploy contract', { id: 'deploy' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Please connect your wallet first</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
          <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contract Interaction
        </h3>
      </div>
      
      <div className="flex space-x-2 mb-6">
        <Button
          onClick={() => setIsDeployMode(false)}
          variant={!isDeployMode ? 'default' : 'outline'}
          className="flex-1"
        >
          Connect Existing
        </Button>
        <Button
          onClick={() => setIsDeployMode(true)}
          variant={isDeployMode ? 'default' : 'outline'}
          className="flex-1"
        >
          Deploy New
        </Button>
      </div>

      {!isDeployMode ? (
        <form onSubmit={handleConnectToExisting} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contract Address
            </label>
            <Input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="ct_...."
              required
            />
          </div>
          
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isLoading || !contractAddress}
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect to Contract'}
            </Button>
            
            {/* Quick Connect to Mock Contract */}
            {contractAddress === 'ct_mgcu3hf44v523o840mx' && (
              <Button
                type="button"
                onClick={handleConnectToExisting}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                🚀 Quick Connect to Demo Contract
              </Button>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={handleDeployNew} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Address
              </label>
              <Input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="ak_..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Freelancer Address
              </label>
              <Input
                type="text"
                value={freelancerAddress}
                onChange={(e) => setFreelancerAddress(e.target.value)}
                placeholder="ak_..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mediator Address
              </label>
              <Input
                type="text"
                value={mediatorAddress}
                onChange={(e) => setMediatorAddress(e.target.value)}
                placeholder="ak_..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (AE)
              </label>
              <Input
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.0"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deadline
              </label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Deploying...' : 'Deploy Contract'}
          </Button>
        </form>
      )}
    </Card>
  );
};

export default ContractForm;