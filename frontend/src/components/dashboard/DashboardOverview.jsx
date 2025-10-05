/**
 * Dashboard Overview Component
 * Modern dashboard with stats cards and overview information
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  DollarSign, 
  TrendingUp, 
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wallet,
  ExternalLink,
  User,
  FileText,
  Settings
} from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { Button } from '../ui/Button';
import { useWallet } from '../../contexts/WalletContext';
import toast from 'react-hot-toast';

export const DashboardOverview = ({ onNavigate }) => {
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

  const stats = [
    {
      title: 'Total Escrows',
      value: '24',
      change: '+12% this month',
      trend: 'up',
      icon: Shield,
    },
    {
      title: 'Total Volume',
      value: '1,247 AE',
      change: '+8% this month',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Active Contracts',
      value: '8',
      change: '3 pending',
      trend: 'neutral',
      icon: Activity,
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+2.1% this month',
      trend: 'up',
      icon: TrendingUp,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'deposit',
      amount: '50 AE',
      user: 'Alice Johnson',
      status: 'completed',
      time: '2 minutes ago',
    },
    {
      id: 2,
      type: 'release',
      amount: '120 AE',
      user: 'Bob Smith',
      status: 'completed',
      time: '15 minutes ago',
    },
    {
      id: 3,
      type: 'dispute',
      amount: '75 AE',
      user: 'Carol Davis',
      status: 'pending',
      time: '1 hour ago',
    },
    {
      id: 4,
      type: 'ai_verification',
      amount: '200 AE',
      user: 'David Wilson',
      status: 'completed',
      time: '2 hours ago',
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'release':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dispute':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'ai_verification':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to TrustLens
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your AI-powered escrow platform for secure, transparent transactions
        </p>
      </motion.div>

      {/* Wallet Connection Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card>
          {!isConnected ? (
            <div className="text-center">
              {!isAvailable ? (
                <div className="space-y-4">
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-xl w-fit mx-auto">
                    <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Superhero Wallet Not Found
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                      Please install Superhero Wallet to connect to the Aeternity blockchain
                    </p>
                    <Button
                      onClick={handleInstallWallet}
                      className="mx-auto"
                      icon={<ExternalLink className="w-4 h-4" />}
                    >
                      Install Superhero Wallet
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Superhero Wallet is the official wallet for the Aeternity blockchain.
                      It allows you to securely manage your AE tokens and interact with dApps.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-xl w-fit mx-auto">
                    <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                      Connect your Superhero Wallet to start using TrustLens escrow platform
                    </p>
                    <Button
                      onClick={connectWallet}
                      disabled={loading}
                      loading={loading}
                      className="mx-auto"
                      icon={<Wallet className="w-4 h-4" />}
                    >
                      {loading ? 'Connecting...' : 'Connect Superhero Wallet'}
                    </Button>
                  </div>
                  {loading && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Please approve the connection in your Superhero Wallet extension
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-xl">
                  <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      🟢 Wallet Connected
                    </p>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      {networkInfo.network}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                      {formatAddress(account?.address)}
                    </p>
                    <button
                      onClick={handleCopyAddress}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <ExternalLink className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Balance: {balance ? `${balance} AE` : 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Disconnect
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={stat.icon}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.type.replace('_', ' ').toUpperCase()} • {activity.user}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.amount}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              {isConnected ? (
                <>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    icon={<Shield className="w-4 h-4" />}
                    onClick={() => onNavigate && onNavigate('escrow')}
                  >
                    Create New Escrow
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<Activity className="w-4 h-4" />}
                    onClick={() => onNavigate && onNavigate('ai')}
                  >
                    AI Verification
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => onNavigate && onNavigate('nfts')}
                  >
                    View NFT Receipts
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<User className="w-4 h-4" />}
                    onClick={() => onNavigate && onNavigate('profile')}
                  >
                    View Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<FileText className="w-4 h-4" />}
                    onClick={() => onNavigate && onNavigate('ledger')}
                  >
                    Transaction Ledger
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<Settings className="w-4 h-4" />}
                    onClick={() => onNavigate && onNavigate('settings')}
                  >
                    Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    disabled 
                    className="w-full" 
                    size="lg" 
                    icon={<Shield className="w-4 h-4" />}
                    title="Connect wallet to create escrow"
                  >
                    Create New Escrow
                  </Button>
                  <Button 
                    disabled 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<Activity className="w-4 h-4" />}
                    title="Connect wallet for AI verification"
                  >
                    AI Verification
                  </Button>
                  <Button 
                    disabled 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<ExternalLink className="w-4 h-4" />}
                    title="Connect wallet to view NFTs"
                  >
                    View NFT Receipts
                  </Button>
                  <Button 
                    disabled 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<User className="w-4 h-4" />}
                    title="Connect wallet to view profile"
                  >
                    View Profile
                  </Button>
                  <Button 
                    disabled 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<FileText className="w-4 h-4" />}
                    title="Connect wallet to view transaction ledger"
                  >
                    Transaction Ledger
                  </Button>
                  <Button 
                    disabled 
                    variant="outline" 
                    className="w-full" 
                    size="lg" 
                    icon={<Settings className="w-4 h-4" />}
                    title="Connect wallet to access settings"
                  >
                    Settings
                  </Button>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                      💡 Connect your wallet to unlock all features
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
