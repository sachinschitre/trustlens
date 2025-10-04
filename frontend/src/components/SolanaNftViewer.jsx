import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '../contexts/SolanaWalletContext';
import SolanaNftService from '../services/SolanaNftService';
import { 
  Wallet, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const SolanaNftViewer = () => {
  const { 
    connection, 
    metaplex, 
    publicKey, 
    isConnected, 
    isConnecting, 
    balance,
    connectWallet,
    disconnectWallet 
  } = useSolanaWallet();

  const [nftService, setNftService] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showDetails, setShowDetails] = useState({});

  const filterOptions = [
    { value: 'all', label: 'All NFTs', count: 0 },
    { value: 'active', label: 'Active', count: 0 },
    { value: 'released', label: 'Released', count: 0 },
    { value: 'disputed', label: 'Disputed', count: 0 },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount_high', label: 'Amount (High to Low)' },
    { value: 'amount_low', label: 'Amount (Low to High)' },
    { value: 'score_high', label: 'Score (High to Low)' },
    { value: 'score_low', label: 'Score (Low to High)' },
  ];

  useEffect(() => {
    if (isConnected && metaplex && publicKey) {
      const service = new SolanaNftService(metaplex, connection, publicKey);
      setNftService(service);
      fetchNfts(service);
    }
  }, [isConnected, metaplex, publicKey, connection]);

  useEffect(() => {
    if (nfts.length > 0) {
      // Update filter counts
      const updatedFilters = filterOptions.map(filter => ({
        ...filter,
        count: filter.value === 'all' ? nfts.length : 
               nfts.filter(nft => nft.status === filter.value).length
      }));

      // Filter and sort NFTs
      const filtered = nftService?.filterNftsByStatus(nfts, selectedFilter) || [];
      const sorted = nftService?.sortNfts(filtered, sortBy) || [];
      setFilteredNfts(sorted);

      // Update stats
      const nftStats = nftService?.getNftStats(nfts);
      setStats(nftStats);
    }
  }, [nfts, selectedFilter, sortBy, nftService]);

  const fetchNfts = async (service) => {
    if (!service) return;

    setLoading(true);
    try {
      const fetchedNfts = await service.getAllNfts();
      setNfts(fetchedNfts);
      
      if (fetchedNfts.length > 0) {
        toast.success(`Found ${fetchedNfts.length} TrustLens NFT${fetchedNfts.length > 1 ? 's' : ''}`);
      } else {
        toast.info('No TrustLens NFTs found in this wallet');
      }
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      toast.error('Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (nftService) {
      fetchNfts(nftService);
    }
  };

  const toggleDetails = (nftId) => {
    setShowDetails(prev => ({
      ...prev,
      [nftId]: !prev[nftId]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'released':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disputed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'released':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disputed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Solana Wallet</h3>
        <p className="text-gray-600 mb-6">
          Connect your Solana wallet to view your TrustLens NFT receipts
        </p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          {isConnecting ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">NFT Receipts</h2>
            <p className="text-gray-600 mt-1">
              Your TrustLens escrow NFT collection on Solana
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <p className="text-lg font-semibold text-gray-900">
                {balance ? `${balance.toFixed(4)} SOL` : '0 SOL'}
              </p>
            </div>
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total NFTs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalValue.toFixed(2)} SOL</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Released</p>
                <p className="text-2xl font-bold text-gray-900">{stats.released}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Disputed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.disputed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))
        ) : filteredNfts.length > 0 ? (
          filteredNfts.map((nft) => (
            <NFTCard
              key={nft.mintAddress}
              nft={nft}
              showDetails={showDetails[nft.mintAddress]}
              onToggleDetails={() => toggleDetails(nft.mintAddress)}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              copyToClipboard={copyToClipboard}
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No NFTs Found</h3>
            <p className="text-gray-600">
              {selectedFilter === 'all' 
                ? 'No TrustLens NFTs found in this wallet'
                : `No ${selectedFilter} NFTs found`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// NFT Card Component
const NFTCard = ({ 
  nft, 
  showDetails, 
  onToggleDetails, 
  getStatusIcon, 
  getStatusColor, 
  copyToClipboard 
}) => {
  const formatAmount = (amount) => {
    return (amount / 1e9).toFixed(4);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* NFT Image */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        {nft.image ? (
          <img 
            src={nft.image} 
            alt={nft.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-primary-600 mx-auto mb-2" />
            <p className="text-primary-600 font-medium">TrustLens NFT</p>
          </div>
        )}
      </div>

      {/* NFT Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {nft.name}
            </h3>
            <p className="text-sm text-gray-600">#{nft.escrowId}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(nft.status)}`}>
            {getStatusIcon(nft.status)}
            <span className="ml-1 capitalize">{nft.status}</span>
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatAmount(nft.amount)} SOL
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Score</p>
            <p className="text-lg font-semibold text-gray-900">
              {nft.completionScore ? `${nft.completionScore}/100` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Toggle Details */}
        <button
          onClick={onToggleDetails}
          className="w-full flex items-center justify-center space-x-2 py-2 text-primary-600 hover:text-primary-700 transition-colors"
        >
          {showDetails ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Hide Details</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Show Details</span>
            </>
          )}
        </button>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Project Description</p>
              <p className="text-sm text-gray-900">{nft.projectDescription}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <div className="flex items-center space-x-1">
                  <p className="text-sm text-gray-900 font-mono">
                    {nft.clientWallet.slice(0, 8)}...
                  </p>
                  <button
                    onClick={() => copyToClipboard(nft.clientWallet, 'Client address')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Freelancer</p>
                <div className="flex items-center space-x-1">
                  <p className="text-sm text-gray-900 font-mono">
                    {nft.freelancerWallet.slice(0, 8)}...
                  </p>
                  <button
                    onClick={() => copyToClipboard(nft.freelancerWallet, 'Freelancer address')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-sm text-gray-900">{formatDate(nft.timestamp)}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                nft.isTransferable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {nft.isTransferable ? 'Transferable' : 'Soulbound'}
              </span>
              
              <button
                onClick={() => copyToClipboard(nft.mintAddress, 'NFT mint address')}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <span>View on Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolanaNftViewer;
