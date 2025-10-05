/**
 * Settings Dashboard Component
 * Application settings and preferences management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Key,
  Trash2,
  Download,
  Upload,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../theme/ThemeProvider';
import toast from 'react-hot-toast';

export const SettingsDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      escrowUpdates: true,
      securityAlerts: true,
      marketingEmails: false
    },
    privacy: {
      profileVisibility: 'public',
      showBalance: true,
      allowDataCollection: false,
      shareAnalytics: false
    },
    security: {
      twoFactorAuth: false,
      autoLock: 15,
      requirePassword: true,
      sessionTimeout: 30
    },
    display: {
      currency: 'AE',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      language: 'en'
    },
    network: {
      rpcEndpoint: 'https://testnet.aeternity.io',
        explorerUrl: 'https://aescan.io',
      gasPrice: 'auto',
      confirmations: 1
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('trustlens-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('trustlens-settings', JSON.stringify(settings));
    setHasChanges(false);
    toast.success('Settings saved successfully');
  };

  const resetSettings = () => {
    localStorage.removeItem('trustlens-settings');
    setSettings({
      notifications: {
        email: true,
        push: true,
        sms: false,
        escrowUpdates: true,
        securityAlerts: true,
        marketingEmails: false
      },
      privacy: {
        profileVisibility: 'public',
        showBalance: true,
        allowDataCollection: false,
        shareAnalytics: false
      },
      security: {
        twoFactorAuth: false,
        autoLock: 15,
        requirePassword: true,
        sessionTimeout: 30
      },
      display: {
        currency: 'AE',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        language: 'en'
      },
      network: {
        rpcEndpoint: 'https://testnet.aeternity.io',
        explorerUrl: 'https://aescan.io',
        gasPrice: 'auto',
        confirmations: 1
      }
    });
    setHasChanges(false);
    toast.success('Settings reset to default');
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trustlens-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setHasChanges(true);
          toast.success('Settings imported successfully');
        } catch (error) {
          toast.error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearCache = () => {
    localStorage.removeItem('trustlens-cache');
    sessionStorage.clear();
    toast.success('Cache cleared successfully');
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        onClick={onChange}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your application preferences and configuration
            </p>
          </div>
          
          <div className="flex space-x-3">
            {hasChanges && (
              <Button
                onClick={saveSettings}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            )}
            <Button
              variant="outline"
              onClick={resetSettings}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Reset
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
              </div>
              
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.notifications.email}
                  onChange={() => updateSetting('notifications', 'email', !settings.notifications.email)}
                  label="Email Notifications"
                  description="Receive updates via email"
                />
                <ToggleSwitch
                  checked={settings.notifications.push}
                  onChange={() => updateSetting('notifications', 'push', !settings.notifications.push)}
                  label="Push Notifications"
                  description="Browser push notifications"
                />
                <ToggleSwitch
                  checked={settings.notifications.escrowUpdates}
                  onChange={() => updateSetting('notifications', 'escrowUpdates', !settings.notifications.escrowUpdates)}
                  label="Escrow Updates"
                  description="Notifications for escrow status changes"
                />
                <ToggleSwitch
                  checked={settings.notifications.securityAlerts}
                  onChange={() => updateSetting('notifications', 'securityAlerts', !settings.notifications.securityAlerts)}
                  label="Security Alerts"
                  description="Important security notifications"
                />
                <ToggleSwitch
                  checked={settings.notifications.marketingEmails}
                  onChange={() => updateSetting('notifications', 'marketingEmails', !settings.notifications.marketingEmails)}
                  label="Marketing Emails"
                  description="Product updates and promotional content"
                />
              </div>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Privacy & Security
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                <ToggleSwitch
                  checked={settings.privacy.showBalance}
                  onChange={() => updateSetting('privacy', 'showBalance', !settings.privacy.showBalance)}
                  label="Show Balance"
                  description="Display wallet balance in profile"
                />

                <ToggleSwitch
                  checked={settings.security.twoFactorAuth}
                  onChange={() => updateSetting('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                  label="Two-Factor Authentication"
                  description="Add extra security to your account"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto-lock (minutes)
                  </label>
                  <Input
                    type="number"
                    value={settings.security.autoLock}
                    onChange={(e) => updateSetting('security', 'autoLock', parseInt(e.target.value))}
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Display Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Display & Appearance
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <div className="flex space-x-3">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => theme !== 'light' && toggleTheme()}
                      size="sm"
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      size="sm"
                    >
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      onClick={() => theme !== 'system' && toggleTheme()}
                      size="sm"
                    >
                      System
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.display.currency}
                    onChange={(e) => updateSetting('display', 'currency', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="AE">AE (Aeternity)</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.display.language}
                    onChange={(e) => updateSetting('display', 'language', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Network Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Network Settings
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    RPC Endpoint
                  </label>
                  <Input
                    value={settings.network.rpcEndpoint}
                    onChange={(e) => updateSetting('network', 'rpcEndpoint', e.target.value)}
                    placeholder="https://testnet.aeternity.io"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Explorer URL
                  </label>
                  <Input
                    value={settings.network.explorerUrl}
                    onChange={(e) => updateSetting('network', 'explorerUrl', e.target.value)}
                    placeholder="https://aescan.io"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gas Price
                  </label>
                  <select
                    value={settings.network.gasPrice}
                    onChange={(e) => updateSetting('network', 'gasPrice', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="auto">Auto</option>
                    <option value="slow">Slow</option>
                    <option value="standard">Standard</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <Database className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Data Management
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Export Settings</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Download your settings as a JSON file
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={exportSettings}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Import Settings</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload a settings JSON file
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <Button
                      variant="outline"
                      icon={<Upload className="w-4 h-4" />}
                      as="span"
                    >
                      Import
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Clear Cache</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Remove cached data and temporary files
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={clearCache}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* System Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Information
                </h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Version:</span>
                  <span className="text-gray-900 dark:text-white font-mono">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Environment:</span>
                  <span className="text-gray-900 dark:text-white">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Network:</span>
                  <span className="text-gray-900 dark:text-white">Aeternity Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Last Updated:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
