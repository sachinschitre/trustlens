import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, AlertTriangle } from 'lucide-react';

const WalletStatusIndicator = () => {
  const { isConnected, isAvailable, account, formatAddress } = useWallet();

  if (!isAvailable) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <span className="text-sm text-orange-700 font-medium">🔴 Wallet Not Found</span>
      </div>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <Wallet className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium">
          🟢 Connected: {formatAddress(account.address)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
      <Wallet className="h-4 w-4 text-gray-600" />
      <span className="text-sm text-gray-700 font-medium">🔴 Disconnected</span>
    </div>
  );
};

export default WalletStatusIndicator;
