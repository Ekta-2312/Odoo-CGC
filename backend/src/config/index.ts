import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration with validation and defaults
 */
export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'civictrack_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Email configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImagesPerIssue: parseInt(process.env.MAX_IMAGES_PER_ISSUE || '5', 10),
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Application configuration
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    defaultIssueRadiusKm: parseInt(process.env.DEFAULT_ISSUE_RADIUS_KM || '5', 10),
    autoHideFlagThreshold: parseInt(process.env.AUTO_HIDE_FLAG_THRESHOLD || '3', 10),
  },

  // External APIs
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },
} as const;

/**
 * Validate required environment variables
 */
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (config.server.env === 'production' && config.jwt.secret === 'fallback_secret_change_in_production') {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }
};
