import React from 'react';
import { Wallet, LogOut, User, ExternalLink, Copy, AlertTriangle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';

const WalletConnection = () => {
  const { 
    account, 
    balance,
    isConnected, 
    isAvailable,
    loading, 
    connectWallet, 
    disconnectWallet, 
    fetchBalance,
    formatAddress,
    getNetworkInfo
  } = useWallet();

  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isConnected && account) {
      fetchBalance();
    }
  }, [isConnected, account, fetchBalance]);

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstallWallet = () => {
    window.open('https://superhero.com/', '_blank');
  };

  const networkInfo = getNetworkInfo();

  if (isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  🟢 Superhero Wallet Connected
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-500 font-mono">
                  {formatAddress(account?.address)}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy address"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-green-600 font-medium">
                  Balance: {balance ? `${balance} AE` : 'Loading...'}
                </p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {networkInfo.network}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
        <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Superhero Wallet Not Found
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Please install Superhero Wallet to connect to the Aeternity blockchain
        </p>
        <button
          onClick={handleInstallWallet}
          className="px-6 py-3 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 mx-auto"
        >
          <ExternalLink className="h-5 w-5" />
          <span>Install Superhero Wallet</span>
        </button>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            Superhero Wallet is the official wallet for the Aeternity blockchain.
            It allows you to securely manage your AE tokens and interact with dApps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
      <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
        <Wallet className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connect Superhero Wallet
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Connect your Superhero Wallet to interact with the escrow contract on {networkInfo.network}
      </p>
      <button
        onClick={connectWallet}
        disabled={loading}
        className={`
          px-6 py-3 rounded-lg font-medium transition-colors
          ${loading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          }
        `}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Connect Superhero Wallet</span>
          </div>
        )}
      </button>
      
      {loading && (
        <p className="text-xs text-gray-500 mt-3">
          Please approve the connection in your Superhero Wallet extension
        </p>
      )}
    </div>
  );
};

export default WalletConnection;
