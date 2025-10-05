/**
 * Mediator Dashboard Component
 * Dashboard specifically designed for mediators to resolve disputes and manage cases
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  MessageCircle,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Gavel,
  Search,
  Filter,
  Award
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';

const MediatorDashboard = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for demonstration
  const stats = [
    {
      title: 'Active Disputes',
      value: '8',
      change: '+2 this week',
      icon: AlertTriangle,
      color: 'red',
      trend: 'up'
    },
    {
      title: 'Resolved Cases',
      value: '24',
      change: '+5 this month',
      icon: CheckCircle,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Success Rate',
      value: '92%',
      change: '+3% this month',
      icon: Award,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Avg. Resolution Time',
      value: '3.2 days',
      change: '-0.5 days',
      icon: Clock,
      color: 'purple',
      trend: 'down'
    }
  ];

  const activeDisputes = [
    {
      id: 1,
      caseNumber: 'DIS-2024-001',
      client: 'TechCorp Inc.',
      freelancer: 'John Smith',
      project: 'E-commerce Website Development',
      disputeType: 'Quality Issues',
      amount: '$5,000',
      status: 'Under Review',
      priority: 'High',
      submittedDate: '2024-01-15',
      daysOpen: 3,
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techcorp',
      freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    },
    {
      id: 2,
      caseNumber: 'DIS-2024-002',
      client: 'StartupXYZ',
      freelancer: 'Sarah Johnson',
      project: 'Mobile App UI/UX Design',
      disputeType: 'Scope Creep',
      amount: '$3,500',
      status: 'Evidence Gathering',
      priority: 'Medium',
      submittedDate: '2024-01-12',
      daysOpen: 6,
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=startup',
      freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    },
    {
      id: 3,
      caseNumber: 'DIS-2024-003',
      client: 'DataFlow Systems',
      freelancer: 'Mike Chen',
      project: 'Database Optimization',
      disputeType: 'Timeline Dispute',
      amount: '$2,200',
      status: 'Awaiting Response',
      priority: 'Low',
      submittedDate: '2024-01-10',
      daysOpen: 8,
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dataflow',
      freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
    }
  ];

  const recentResolutions = [
    {
      id: 1,
      caseNumber: 'DIS-2023-045',
      resolution: 'Partial Release',
      clientSatisfied: true,
      freelancerSatisfied: true,
      amountReleased: '$4,200',
      resolutionDate: '2024-01-08',
      resolutionTime: '2 days'
    },
    {
      id: 2,
      caseNumber: 'DIS-2023-044',
      resolution: 'Full Release to Freelancer',
      clientSatisfied: false,
      freelancerSatisfied: true,
      amountReleased: '$1,800',
      resolutionDate: '2024-01-05',
      resolutionTime: '4 days'
    },
    {
      id: 3,
      caseNumber: 'DIS-2023-043',
      resolution: 'Refund to Client',
      clientSatisfied: true,
      freelancerSatisfied: false,
      amountReleased: '$0',
      resolutionDate: '2024-01-03',
      resolutionTime: '3 days'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'Evidence Gathering': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'Awaiting Response': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Resolve disputes and ensure fair outcomes for all parties
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Scale className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Certified Mediator
            </span>
          </div>
          <Button className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Search Cases</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                    <p className={`text-xs mt-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Disputes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Disputes
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {activeDisputes.map((dispute) => (
              <motion.div
                key={dispute.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex -space-x-2">
                  <img
                    src={dispute.clientAvatar}
                    alt={dispute.client}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"
                  />
                  <img
                    src={dispute.freelancerAvatar}
                    alt={dispute.freelancer}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {dispute.caseNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dispute.client} vs {dispute.freelancer}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {dispute.project}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {dispute.daysOpen} days
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {dispute.amount}
                  </div>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Eye className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Resolutions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Resolutions
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentResolutions.map((resolution) => (
              <motion.div
                key={resolution.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {resolution.caseNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {resolution.resolution}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Client:</span>
                      {resolution.clientSatisfied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Freelancer:</span>
                      {resolution.freelancerSatisfied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {resolution.resolutionTime}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {resolution.amountReleased}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {resolution.resolutionDate}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <AlertTriangle className="w-5 h-5" />
            <span>New Dispute</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <MessageCircle className="w-5 h-5" />
            <span>Mediation Room</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <FileText className="w-5 h-5" />
            <span>Case Reports</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <TrendingUp className="w-5 h-5" />
            <span>Analytics</span>
          </Button>
        </div>
      </Card>

      {/* Dispute Resolution Guidelines */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Mediation Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Resolution Principles</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Maintain impartiality and fairness</li>
              <li>• Consider all evidence and testimony</li>
              <li>• Apply industry standards and best practices</li>
              <li>• Ensure both parties are heard</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Resolution Types</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Full release to freelancer</li>
              <li>• Partial release based on completion</li>
              <li>• Refund to client</li>
              <li>• Additional work required</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MediatorDashboard;
