import winston from 'winston';
import path from 'path';
import fs from 'fs';

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    // Ensure logs directory exists
    const logDir = path.dirname('logs/sync-service.log');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
          
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          
          if (stack) {
            log += `\n${stack}`;
          }
          
          return log;
        })
      ),
      defaultMeta: { service: 'cross-chain-sync' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: 'logs/sync-service.log',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          tailable: true
        }),
        
        // File transport for errors only
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          tailable: true
        })
      ]
    });

    // Handle uncaught exceptions and unhandled rejections
    this.logger.exceptions.handle(
      new winston.transports.File({ filename: 'logs/exceptions.log' })
    );

    this.logger.rejections.handle(
      new winston.transports.File({ filename: 'logs/rejections.log' })
    );
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, error?: any, meta?: any): void {
    if (error instanceof Error) {
      this.logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else {
      this.logger.error(message, { error, ...meta });
    }
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public http(message: string, meta?: any): void {
    this.logger.http(message, meta);
  }

  // Specialized logging methods for cross-chain operations
  public logAeternityEvent(event: string, data: any): void {
    this.info(`Aeternity Event: ${event}`, { 
      chain: 'aeternity', 
      event, 
      data 
    });
  }

  public logSolanaTransaction(operation: string, txHash: string, data?: any): void {
    this.info(`Solana Transaction: ${operation}`, { 
      chain: 'solana', 
      operation, 
      txHash, 
      data 
    });
  }

  public logSyncOperation(operation: string, escrowId: string, status: string, details?: any): void {
    this.info(`Sync Operation: ${operation}`, { 
      operation, 
      escrowId, 
      status, 
      details 
    });
  }

  public logError(operation: string, error: any, context?: any): void {
    this.error(`Sync Error: ${operation}`, error, { 
      operation, 
      context 
    });
  }

  public logPerformance(operation: string, duration: number, details?: any): void {
    this.info(`Performance: ${operation}`, { 
      operation, 
      duration: `${duration}ms`, 
      details 
    });
  }

  // Create child logger with additional context
  public child(defaultMeta: any): winston.Logger {
    return this.logger.child(defaultMeta);
  }

  // Get the underlying winston logger for advanced usage
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}
