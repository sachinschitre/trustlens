/**
 * Freelancer Dashboard Component
 * Dashboard specifically designed for freelancers to manage their work and clients
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
  Briefcase,
  Target,
  CheckCircle
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';

const FreelancerDashboard = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for demonstration
  const stats = [
    {
      title: 'Active Projects',
      value: '5',
      change: '+2 this month',
      icon: Briefcase,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Earnings This Month',
      value: '$8,450',
      change: '+18% from last month',
      icon: DollarSign,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Completed Projects',
      value: '23',
      change: '+3 this month',
      icon: CheckCircle,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Client Rating',
      value: '4.9',
      change: '+0.1 this month',
      icon: Star,
      color: 'yellow',
      trend: 'up'
    }
  ];

  const activeProjects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      client: 'TechCorp Inc.',
      status: 'In Progress',
      progress: 75,
      budget: '$5,000',
      deadline: '2024-02-15',
      hourlyRate: '$75',
      timeSpent: '45h',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techcorp'
    },
    {
      id: 2,
      title: 'Mobile App UI/UX Design',
      client: 'StartupXYZ',
      status: 'Review',
      progress: 100,
      budget: '$3,500',
      deadline: '2024-02-10',
      hourlyRate: '$65',
      timeSpent: '32h',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=startup'
    },
    {
      id: 3,
      title: 'Database Optimization',
      client: 'DataFlow Systems',
      status: 'Completed',
      progress: 100,
      budget: '$2,200',
      deadline: '2024-02-05',
      hourlyRate: '$85',
      timeSpent: '28h',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dataflow'
    }
  ];

  const availableJobs = [
    {
      id: 1,
      title: 'React Native Mobile App Development',
      client: 'MobileFirst Co.',
      budget: '$4,500 - $6,000',
      duration: '3-4 weeks',
      posted: '2 hours ago',
      skills: ['React Native', 'JavaScript', 'Firebase'],
      proposals: 12,
      rating: 4.8,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mobilefirst'
    },
    {
      id: 2,
      title: 'Full-Stack Web Application',
      client: 'WebSolutions Ltd.',
      budget: '$7,000 - $10,000',
      duration: '6-8 weeks',
      posted: '4 hours ago',
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      proposals: 8,
      rating: 4.9,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=websolutions'
    },
    {
      id: 3,
      title: 'UI/UX Design for SaaS Platform',
      client: 'SaaS Innovations',
      budget: '$2,800 - $4,200',
      duration: '2-3 weeks',
      posted: '6 hours ago',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      proposals: 15,
      rating: 4.7,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=saas'
    }
  ];

  const recentClients = [
    {
      id: 1,
      name: 'TechCorp Inc.',
      projects: 3,
      totalEarnings: '$12,500',
      rating: 4.9,
      lastProject: 'E-commerce Website',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techcorp',
      isActive: true
    },
    {
      id: 2,
      name: 'StartupXYZ',
      projects: 2,
      totalEarnings: '$8,200',
      rating: 4.8,
      lastProject: 'Mobile App Design',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=startup',
      isActive: true
    },
    {
      id: 3,
      name: 'DataFlow Systems',
      projects: 1,
      totalEarnings: '$2,200',
      rating: 4.9,
      lastProject: 'Database Optimization',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dataflow',
      isActive: false
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
            Manage your projects, find new opportunities, and grow your freelance business
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Search className="w-4 h-4" />
          <span>Find Jobs</span>
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
        {/* Active Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Projects
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <motion.div
                key={project.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={project.avatar}
                  alt={project.client}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client: {project.client}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {project.budget}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {project.timeSpent}
                    </span>
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Due: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Clients */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Clients
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentClients.map((client) => (
              <motion.div
                key={client.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {client.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {client.projects} projects • {client.totalEarnings} earned
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {client.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Last: {client.lastProject}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Message
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Available Jobs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Jobs
          </h2>
          <Button variant="outline" size="sm">
            View All Jobs
          </Button>
        </div>
        
        <div className="space-y-4">
          {availableJobs.map((job) => (
            <motion.div
              key={job.id}
              className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={job.avatar}
                alt={job.client}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {job.client} • Posted {job.posted}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm font-medium text-green-600">
                    {job.budget}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {job.duration}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {job.proposals} proposals
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {job.rating}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button size="sm">
                  Apply Now
                </Button>
                <Button size="sm" variant="outline">
                  Save
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <Search className="w-5 h-5" />
            <span>Browse Jobs</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <FileText className="w-5 h-5" />
            <span>Update Portfolio</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <MessageCircle className="w-5 h-5" />
            <span>Messages</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-16">
            <Target className="w-5 h-5" />
            <span>Set Goals</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FreelancerDashboard;
