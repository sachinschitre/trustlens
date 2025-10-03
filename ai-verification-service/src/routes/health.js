const express = require('express');
const AIVerificationService = require('../services/AIVerificationService');
const logger = require('../utils/logger');

const router = express.Router();
const aiService = new AIVerificationService();

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    service: 'TrustLens AI Verification Service',
    version: '1.0.0'
  };

  logger.info('Health check requested');
  res.status(200).json(healthCheck);
});

/**
 * GET /api/health/detailed
 * Detailed health check including AI service status
 */
router.get('/detailed', async (req, res) => {
  try {
    logger.info('Detailed health check requested');
    
    const aiHealth = await aiService.healthCheck();
    
    const healthCheck = {
      status: aiHealth.status === 'healthy' ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'TrustLens AI Verification Service',
      version: '1.0.0',
      components: {
        api: {
          status: 'healthy',
          responseTime: Date.now() - req.startTime
        },
        ai: aiHealth,
        database: {
          status: 'not_configured',
          message: 'No database required for this service'
        }
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
      }
    };

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthCheck);

  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    res.status(503).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/ready
 * Readiness probe for Kubernetes/Docker
 */
router.get('/ready', async (req, res) => {
  try {
    const aiHealth = await aiService.healthCheck();
    
    if (aiHealth.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        reason: 'AI service unavailable',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/live
 * Liveness probe for Kubernetes/Docker
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
