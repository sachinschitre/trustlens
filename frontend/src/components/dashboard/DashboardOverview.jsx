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
  AlertTriangle
} from 'lucide-react';
import { Card, StatCard } from '../ui/Card';
import { Button } from '../ui/Button';

export const DashboardOverview = () => {
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
              <Button className="w-full" size="lg">
                Create New Escrow
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                AI Verification
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                View NFT Receipts
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Transaction History
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
