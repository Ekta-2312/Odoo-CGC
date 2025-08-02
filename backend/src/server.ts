import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import database from './config/database';
import { User } from './models/User';
import { Issue } from './models/Issue';

// Load environment variables
dotenv.config();

/**
 * CivicTrack API Server
 * A comprehensive civic issue reporting and tracking system with MongoDB
 */
class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware stack
   */
  private initializeMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }));

    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.app.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.security.rateLimitWindowMs,
      max: config.security.rateLimitMaxRequests,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static file serving for uploads
    this.app.use('/uploads', express.static(config.upload.uploadPath));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'CivicTrack API is running',
        timestamp: new Date().toISOString(),
        environment: config.server.env,
      });
    });
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // API route prefix
    const apiPrefix = '/api/v1';

    // Route registration
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/issues`, issueRoutes);
    this.app.use(`${apiPrefix}/admin`, adminRoutes);
    this.app.use(`${apiPrefix}/upload`, uploadRoutes);

    // API documentation endpoint
    this.app.get(`${apiPrefix}`, (req, res) => {
      res.json({
        success: true,
        message: 'CivicTrack API v1.0',
        documentation: 'https://api-docs.civictrack.com',
        endpoints: {
          auth: `${apiPrefix}/auth`,
          users: `${apiPrefix}/users`,
          issues: `${apiPrefix}/issues`,
          admin: `${apiPrefix}/admin`,
          upload: `${apiPrefix}/upload`,
        },
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler for undefined routes
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();
      logger.info('✅ Configuration validated');

      // Test database connection
      const dbConnected = await testConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }

      // Start HTTP server
      this.app.listen(this.port, config.server.host, () => {
        logger.info(`🚀 CivicTrack API server started`);
        logger.info(`📍 Server running on http://${config.server.host}:${this.port}`);
        logger.info(`🌍 Environment: ${config.server.env}`);
        logger.info(`📊 Database: ${config.database.name}@${config.database.host}:${config.database.port}`);
      });
    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('🔄 Starting graceful shutdown...');
    
    try {
      // Close database connections
      await db.destroy();
      logger.info('✅ Database connections closed');
      
      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Get Express app instance
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// Handle process signals for graceful shutdown
const server = new Server();

process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

// Start the server
if (require.main === module) {
  server.start().catch((error) => {
    logger.error('❌ Unhandled error during startup:', error);
    process.exit(1);
  });
}

export default server;
