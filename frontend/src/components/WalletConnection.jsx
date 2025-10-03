import React from 'react';
import { Wallet, LogOut, User, Wallet as WalletIcon } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const WalletConnection = () => {
  const { account, isConnected, loading, connectWallet, disconnectWallet, getBalance } = useWallet();
  const [balance, setBalance] = React.useState(null);

  React.useEffect(() => {
    if (isConnected && account) {
      const fetchBalance = async () => {
        const balance = await getBalance();
        setBalance(balance);
      };
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [isConnected, account, getBalance]);

  const formatAddress = (address) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (!balance) return '0 AE';
    return `${(balance / 1e18).toFixed(4)} AE`;
  };

  if (isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <WalletIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Connected Wallet
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {formatAddress(account)}
              </p>
              <p className="text-xs text-green-600 font-medium">
                Balance: {formatBalance(balance)}
              </p>
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
      <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-4">
        <Wallet className="h-8 w-8 text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connect Your Wallet
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Connect your Superhero Wallet to interact with the escrow contract
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
            <span className="loader"></span>
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
          Please open your Superhero Wallet extension
        </p>
      )}
    </div>
  );
};

export default WalletConnection;
