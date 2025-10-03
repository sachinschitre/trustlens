import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Copy, ExternalLink } from 'lucide-react';

const TransactionStatus = ({ txHash, status, gasUsed }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'failed':
        case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTxHash = (hash) => {
    if (!hash || hash.length < 20) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
  };

  const getTransactionUrl = (hash) => {
    // Aeternity explorer URL (adjust for testnet/mainnet)
    return `https://testnet.explorable.com/transactions/${hash}`;
  };

  if (!txHash) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No transaction found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {getStatusIcon()}
            <span className="ml-2">Transaction Status</span>
          </h3>
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${getStatusColor()}
          `}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-4">
          {/* Transaction Hash */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Transaction Hash
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono text-gray-800">
                {formatTxHash(txHash)}
              </code>
              <button
                onClick={() => copyToClipboard(txHash)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <a
                href={getTransactionUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
            )}
          </div>

          {/* Gas Used */}
          {gasUsed && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Gas Used
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {gasUsed.toLocaleString()}
              </p>
            </div>
          )}

          {/* Status Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Transaction Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Status:</span> {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
              {status.toLowerCase() === 'success' && (
                <p className="text-green-600 font-medium">
                  Transaction confirmed on the blockchain
                </p>
              )}
              {status.toLowerCase() === 'pending' && (
                <p className="text-yellow-600 font-medium">
                  Transaction is being processed...
                </p>
              )}
              {status.toLowerCase() === 'failed' && (
                <p className="text-red-600 font-medium">
                  Transaction failed to execute
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Refresh Status
          </button>
          <a
            href={getTransactionUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
