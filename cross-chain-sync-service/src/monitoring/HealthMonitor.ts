import { Logger } from '../utils/Logger';
import { ConfigManager } from '../config/ConfigManager';
import { CrossChainSyncService } from '../services/CrossChainSyncService';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  uptime: number;
  components: {
    aeternity: ComponentHealth;
    solana: ComponentHealth;
    sync: ComponentHealth;
    server: ComponentHealth;
  };
  metrics: {
    totalEvents: number;
    successfulOperations: number;
    failedOperations: number;
    pendingOperations: number;
    errorRate: number;
  };
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
  details?: any;
  error?: string;
}

export interface Metrics {
  requests: number;
  errors: number;
  responseTime: number;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

export class HealthMonitor {
  private logger: Logger;
  private config: ConfigManager;
  private syncService: CrossChainSyncService;
  private startTime: number;
  private metrics: Metrics;
  private isRunning: boolean = false;

  constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
    this.startTime = Date.now();
    
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: 0,
      uptime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }

  public async start(): Promise<void> {
    try {
      this.logger.info('🏥 Starting health monitoring...');
      this.isRunning = true;
      
      // Start periodic health checks
      this.startPeriodicChecks();
      
      this.logger.info('✅ Health monitoring started');
    } catch (error) {
      this.logger.error('Failed to start health monitoring:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      this.logger.info('🛑 Stopping health monitoring...');
      this.isRunning = false;
      this.logger.info('✅ Health monitoring stopped');
    } catch (error) {
      this.logger.error('Failed to stop health monitoring:', error);
    }
  }

  public async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      this.metrics.requests++;
      
      const syncStats = this.syncService?.getStats() || {
        totalEvents: 0,
        successfulOperations: 0,
        failedOperations: 0,
        pendingOperations: 0,
        lastSyncTime: 0,
        uptime: 0,
      };

      // Check individual components
      const aeternityHealth = await this.checkAeternityHealth();
      const solanaHealth = await this.checkSolanaHealth();
      const syncHealth = await this.checkSyncHealth();
      const serverHealth = this.checkServerHealth();

      // Calculate overall status
      const componentStatuses = [aeternityHealth, solanaHealth, syncHealth, serverHealth];
      const unhealthyCount = componentStatuses.filter(c => c.status === 'unhealthy').length;
      const degradedCount = componentStatuses.filter(c => c.status === 'degraded').length;

      let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
      if (unhealthyCount > 0) {
        overallStatus = 'unhealthy';
      } else if (degradedCount > 0) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'healthy';
      }

      const errorRate = syncStats.totalEvents > 0 
        ? (syncStats.failedOperations / syncStats.totalEvents) * 100 
        : 0;

      const healthStatus: HealthStatus = {
        status: overallStatus,
        timestamp: Date.now(),
        uptime: Date.now() - this.startTime,
        components: {
          aeternity: aeternityHealth,
          solana: solanaHealth,
          sync: syncHealth,
          server: serverHealth,
        },
        metrics: {
          totalEvents: syncStats.totalEvents,
          successfulOperations: syncStats.successfulOperations,
          failedOperations: syncStats.failedOperations,
          pendingOperations: syncStats.pendingOperations,
          errorRate: Math.round(errorRate * 100) / 100,
        },
      };

      this.metrics.responseTime = Date.now() - startTime;
      return healthStatus;

    } catch (error) {
      this.metrics.errors++;
      this.logger.error('Health check failed:', error);
      
      return {
        status: 'unhealthy',
        timestamp: Date.now(),
        uptime: Date.now() - this.startTime,
        components: {
          aeternity: { status: 'unhealthy', lastCheck: Date.now(), error: 'Health check failed' },
          solana: { status: 'unhealthy', lastCheck: Date.now(), error: 'Health check failed' },
          sync: { status: 'unhealthy', lastCheck: Date.now(), error: 'Health check failed' },
          server: { status: 'unhealthy', lastCheck: Date.now(), error: 'Health check failed' },
        },
        metrics: {
          totalEvents: 0,
          successfulOperations: 0,
          failedOperations: 0,
          pendingOperations: 0,
          errorRate: 100,
        },
      };
    }
  }

  private async checkAeternityHealth(): Promise<ComponentHealth> {
    try {
      const aeternityConfig = this.config.getAeternityConfig();
      
      // Check if sync service is available
      if (!this.syncService) {
        return {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: 'Sync service not initialized',
        };
      }

      const serviceStatus = this.syncService.getServiceStatus();
      const aeternityInfo = serviceStatus.aeternity;

      if (!aeternityInfo?.connected) {
        return {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: 'Aeternity connection failed',
          details: aeternityInfo,
        };
      }

      // Check if we're getting recent events
      const lastEventTime = serviceStatus.stats.lastSyncTime;
      const timeSinceLastEvent = Date.now() - lastEventTime;
      const maxSilenceTime = aeternityConfig.pollingInterval * 3; // 3x polling interval

      if (timeSinceLastEvent > maxSilenceTime && serviceStatus.stats.totalEvents > 0) {
        return {
          status: 'degraded',
          lastCheck: Date.now(),
          details: {
            ...aeternityInfo,
            timeSinceLastEvent,
            maxSilenceTime,
          },
        };
      }

      return {
        status: 'healthy',
        lastCheck: Date.now(),
        details: aeternityInfo,
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: Date.now(),
        error: error.message,
      };
    }
  }

  private async checkSolanaHealth(): Promise<ComponentHealth> {
    try {
      if (!this.syncService) {
        return {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: 'Sync service not initialized',
        };
      }

      const serviceStatus = this.syncService.getServiceStatus();
      const solanaInfo = serviceStatus.solana;
      const queueStatus = serviceStatus.queue;

      if (!solanaInfo) {
        return {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: 'Solana connection failed',
        };
      }

      // Check queue health
      const maxQueueSize = this.config.getSyncConfig().maxConcurrentOperations * 2;
      if (queueStatus.queueLength > maxQueueSize) {
        return {
          status: 'degraded',
          lastCheck: Date.now(),
          details: {
            ...solanaInfo,
            queueStatus,
            maxQueueSize,
          },
        };
      }

      return {
        status: 'healthy',
        lastCheck: Date.now(),
        details: {
          ...solanaInfo,
          queueStatus,
        },
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: Date.now(),
        error: error.message,
      };
    }
  }

  private async checkSyncHealth(): Promise<ComponentHealth> {
    try {
      if (!this.syncService) {
        return {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: 'Sync service not initialized',
        };
      }

      const serviceStatus = this.syncService.getServiceStatus();
      const stats = serviceStatus.stats;

      // Check if sync service is running
      if (!serviceStatus.isRunning) {
        return {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: 'Sync service not running',
        };
      }

      // Check error rate
      const errorRate = stats.totalEvents > 0 
        ? (stats.failedOperations / stats.totalEvents) * 100 
        : 0;

      if (errorRate > 10) { // More than 10% error rate
        return {
          status: 'degraded',
          lastCheck: Date.now(),
          details: {
            errorRate: Math.round(errorRate * 100) / 100,
            stats,
          },
        };
      }

      return {
        status: 'healthy',
        lastCheck: Date.now(),
        details: stats,
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: Date.now(),
        error: error.message,
      };
    }
  }

  private checkServerHealth(): ComponentHealth {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Check memory usage
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      if (memoryUsagePercent > 90) {
        return {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: 'High memory usage',
          details: {
            memoryUsage,
            memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
          },
        };
      }

      if (memoryUsagePercent > 80) {
        return {
          status: 'degraded',
          lastCheck: Date.now(),
          details: {
            memoryUsage,
            memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
          },
        };
      }

      return {
        status: 'healthy',
        lastCheck: Date.now(),
        details: {
          memoryUsage,
          memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
          uptime: Date.now() - this.startTime,
        },
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: Date.now(),
        error: error.message,
      };
    }
  }

  private startPeriodicChecks(): void {
    setInterval(async () => {
      try {
        const health = await this.getHealthStatus();
        
        // Log health status if unhealthy or degraded
        if (health.status !== 'healthy') {
          this.logger.warn(`Health status: ${health.status}`, {
            components: health.components,
            metrics: health.metrics,
          });
        }

        // Update metrics
        this.updateMetrics();

      } catch (error) {
        this.logger.error('Periodic health check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private updateMetrics(): void {
    this.metrics.uptime = Date.now() - this.startTime;
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.cpuUsage = process.cpuUsage();
  }

  public getMetrics(): Metrics {
    return { ...this.metrics };
  }

  public setSyncService(syncService: CrossChainSyncService): void {
    this.syncService = syncService;
  }
}
