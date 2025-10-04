#!/usr/bin/env node

/**
 * TrustLens Cross-Chain Sync Service
 * 
 * This service synchronizes escrow events between Aeternity and Solana blockchains.
 * It listens to Aeternity smart contract events and triggers corresponding actions
 * on Solana (NFT minting and metadata updates).
 */

import dotenv from 'dotenv';
import { CrossChainSyncService } from './services/CrossChainSyncService';
import { Logger } from './utils/Logger';
import { ConfigManager } from './config/ConfigManager';
import { HealthMonitor } from './monitoring/HealthMonitor';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

// Load environment variables
dotenv.config();

const logger = Logger.getInstance();
const config = ConfigManager.getInstance();

async function main() {
  try {
    logger.info('🚀 Starting TrustLens Cross-Chain Sync Service...');

    // Validate configuration
    config.validateConfig();
    logger.info('✅ Configuration validated');

    // Initialize health monitoring
    const healthMonitor = new HealthMonitor();
    await healthMonitor.start();
    logger.info('✅ Health monitoring started');

    // Start Express server for health checks and metrics
    const app = express();
    app.use(helmet());
    app.use(cors());
    app.use(compression());

    // Health check endpoint
    app.get('/health', async (req, res) => {
      const health = await healthMonitor.getHealthStatus();
      res.status(health.status === 'healthy' ? 200 : 503).json(health);
    });

    // Metrics endpoint
    app.get('/metrics', (req, res) => {
      const metrics = healthMonitor.getMetrics();
      res.json(metrics);
    });

    // Service info endpoint
    app.get('/', (req, res) => {
      res.json({
        service: 'TrustLens Cross-Chain Sync Service',
        version: '1.0.0',
        status: 'running',
        chains: {
          aeternity: config.aeternity.network,
          solana: config.solana.cluster
        },
        endpoints: {
          health: '/health',
          metrics: '/metrics'
        }
      });
    });

    const port = config.server.port || 3003;
    app.listen(port, () => {
      logger.info(`🌐 Health server running on port ${port}`);
    });

    // Initialize and start the cross-chain sync service
    const syncService = new CrossChainSyncService();
    await syncService.initialize();
    logger.info('✅ Cross-chain sync service initialized');

    // Start synchronization
    await syncService.start();
    logger.info('🔄 Cross-chain synchronization started');

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      logger.info('🛑 Received SIGINT, shutting down gracefully...');
      await syncService.stop();
      await healthMonitor.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('🛑 Received SIGTERM, shutting down gracefully...');
      await syncService.stop();
      await healthMonitor.stop();
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('💥 Failed to start service:', error);
    process.exit(1);
  }
}

// Start the service
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
