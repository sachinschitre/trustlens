/**
 * Profile Dashboard Component
 * User profile management with wallet details and activity
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Wallet, 
  Activity, 
  Settings, 
  Shield, 
  Copy, 
  ExternalLink,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useWallet } from '../../contexts/WalletContext';
import toast from 'react-hot-toast';

export const ProfileDashboard = () => {
  const { isConnected, account, balance } = useWallet();
  const [profileData, setProfileData] = useState({
    username: 'TrustLens User',
    email: 'user@trustlens.io',
    joinDate: '2024-01-15',
    totalEscrows: 12,
    totalVolume: 1250.75,
    successRate: 96.5,
    reputation: 850
  });

  // Empty recent activity - will only show real transactions from connected wallet
  const [recentActivity, setRecentActivity] = useState([]);

  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Escrow', description: 'Completed your first escrow transaction', earned: true, date: '2024-01-15' },
    { id: 2, name: 'Trusted Trader', description: 'Successfully completed 10 escrow transactions', earned: true, date: '2024-01-18' },
    { id: 3, name: 'Volume Master', description: 'Reached 1000 AE in total transaction volume', earned: true, date: '2024-01-20' },
    { id: 4, name: 'Dispute Resolver', description: 'Successfully resolved a dispute', earned: false, date: null },
    { id: 5, name: 'Early Adopter', description: 'Joined TrustLens in the first month', earned: true, date: '2024-01-15' }
  ]);

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast.success('Wallet address copied to clipboard');
    }
  };

  const handleViewOnExplorer = (txHash) => {
    const explorerUrl = `https://aescan.io/transactions/${txHash}`;
    window.open(explorerUrl, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'release': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'dispute': return <Shield className="w-4 h-4 text-yellow-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'resolved': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <User className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account settings and view your transaction history
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {profileData.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {profileData.email}
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profileData.joinDate)}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Wallet Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Wallet className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Wallet Information
                </h3>
              </div>
              
              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Address:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {account?.address ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}` : 'Not connected'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyAddress}
                        icon={<Copy className="w-3 h-3" />}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Balance:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {balance || '0'} AE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                      Connected
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Wallet not connected
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Statistics
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Escrows:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {profileData.totalEscrows}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Volume:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {profileData.totalVolume} AE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Success Rate:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {profileData.successRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Reputation:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {profileData.reputation}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Activity & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {activity.type} - {activity.amount} AE
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                        </p>
                        <button
                          onClick={() => handleViewOnExplorer(activity.txHash)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer font-mono"
                          title="Click to view on Aeternity Explorer"
                        >
                          TX: {activity.txHash.slice(0, 8)}...{activity.txHash.slice(-6)}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOnExplorer(activity.txHash)}
                        icon={<ExternalLink className="w-3 h-3" />}
                        title="View on Explorer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Achievements
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-lg border-2 ${
                      achievement.earned 
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Award className={`w-6 h-6 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h4 className={`font-medium ${achievement.earned ? 'text-yellow-900 dark:text-yellow-100' : 'text-gray-600 dark:text-gray-400'}`}>
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Earned on {formatDate(achievement.date)}
                          </p>
                        )}
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
