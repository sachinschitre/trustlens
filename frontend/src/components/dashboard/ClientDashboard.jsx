/**
 * Client Dashboard Component
 * Dashboard specifically designed for clients to manage projects and freelancers
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  FileText,
  TrendingUp,
  Award,
  Calendar,
  MessageCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { useTransactions } from '../../contexts/TransactionContext';

const ClientDashboard = ({ user }) => {
  const { showTransactionConfirmation } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Test function to demonstrate transaction confirmation modal
  const testTransactionModal = (type) => {
    const testTxHash = `th_${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`;
    showTransactionConfirmation({
      type: type,
      tx_hash: testTxHash,
      amount: type === 'deposit' ? '5.0 AE' : type === 'release' ? 'Contract Release' : 'Dispute Filed',
      timestamp: new Date().toISOString()
    });
  };

  // Mock data for demonstration
  const stats = [
    {
      title: 'Active Projects',
      value: '12',
      change: '+3 this month',
      icon: FileText,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Total Spent',
      value: '$24,580',
      change: '+12% from last month',
      icon: DollarSign,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Freelancers Hired',
      value: '8',
      change: '+2 new hires',
      icon: Users,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Avg. Rating',
      value: '4.8',
      change: '+0.2 this month',
      icon: Star,
      color: 'yellow',
      trend: 'up'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      freelancer: 'John Smith',
      status: 'In Progress',
      progress: 75,
      budget: '$5,000',
      deadline: '2024-02-15',
      rating: 4.9,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    },
    {
      id: 2,
      title: 'Mobile App UI/UX Design',
      freelancer: 'Sarah Johnson',
      status: 'Review',
      progress: 100,
      budget: '$3,500',
      deadline: '2024-02-10',
      rating: 4.7,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    },
    {
      id: 3,
      title: 'Database Optimization',
      freelancer: 'Mike Chen',
      status: 'Completed',
      progress: 100,
      budget: '$2,200',
      deadline: '2024-02-05',
      rating: 4.8,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
    }
  ];

  const topFreelancers = [
    {
      id: 1,
      name: 'John Smith',
      title: 'Full-Stack Developer',
      rating: 4.9,
      completedProjects: 45,
      hourlyRate: '$75',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      skills: ['React', 'Node.js', 'Python', 'AWS']
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      title: 'UI/UX Designer',
      rating: 4.8,
      completedProjects: 32,
      hourlyRate: '$65',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping']
    },
    {
      id: 3,
      name: 'Mike Chen',
      title: 'Database Administrator',
      rating: 4.7,
      completedProjects: 28,
      hourlyRate: '$85',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      skills: ['PostgreSQL', 'MongoDB', 'Redis', 'AWS RDS']
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'In Progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'Review': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your projects and track progress with your freelancers
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
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
        {/* Recent Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Projects
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <motion.div
                key={project.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={project.avatar}
                  alt={project.freelancer}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    with {project.freelancer}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {project.budget}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {project.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.progress}%
                  </div>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Top Freelancers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Top Freelancers
            </h2>
            <Button variant="outline" size="sm">
              Browse All
            </Button>
          </div>
          
          <div className="space-y-4">
            {topFreelancers.map((freelancer) => (
              <motion.div
                key={freelancer.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={freelancer.avatar}
                  alt={freelancer.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {freelancer.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {freelancer.title}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {freelancer.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {freelancer.completedProjects} projects
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {freelancer.hourlyRate}/hr
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {freelancer.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {freelancer.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        +{freelancer.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Hire
                </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <Search className="w-5 h-5" />
            <span>Find Freelancers</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <MessageCircle className="w-5 h-5" />
            <span>View Messages</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <Calendar className="w-5 h-5" />
            <span>Schedule Meeting</span>
          </Button>
        </div>
        
        {/* Test Transaction Modal Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Test Transaction Confirmation Modal:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testTransactionModal('deposit')}
              className="flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Test Deposit</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testTransactionModal('release')}
              className="flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Test Release</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testTransactionModal('dispute')}
              className="flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Test Dispute</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClientDashboard;
