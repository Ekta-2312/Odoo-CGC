import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * MongoDB Connection Configuration
 */
class Database {
  private connectionString: string;
  private options: mongoose.ConnectOptions;

  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/CivicTrack';
    this.options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      console.log('🔄 Connecting to MongoDB...');
      
      await mongoose.connect(this.connectionString, this.options);
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📍 Database: ${mongoose.connection.name}`);
      console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      
      // Handle connection events
      this.setupEventHandlers();
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('📴 MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  /**
   * Setup connection event handlers
   */
  private setupEventHandlers(): void {
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await this.disconnect();
        console.log('🛑 Application terminated, database connection closed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      try {
        await this.disconnect();
        console.log('🛑 Application terminated, database connection closed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{
    status: string;
    database: string;
    host: string;
    port: number;
    readyState: string;
    collections: string[];
  }> {
    try {
      const connection = mongoose.connection;
      if (!connection.db) {
        throw new Error('Database connection not established');
      }
      const collections = await connection.db.listCollections().toArray();
      
      return {
        status: 'healthy',
        database: connection.name,
        host: connection.host,
        port: connection.port,
        readyState: this.getConnectionStatus(),
        collections: collections.map(col => col.name)
      };
    } catch (error) {
      throw new Error(`Database health check failed: ${error}`);
    }
  }

  /**
   * Create database indexes for optimal performance
   */
  async createIndexes(): Promise<void> {
    try {
      console.log('🔄 Creating database indexes...');
      
      // Let Mongoose handle index creation automatically
      await mongoose.syncIndexes();
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Drop database (use with caution)
   */
  async dropDatabase(): Promise<void> {
    try {
      console.log('⚠️  Dropping database...');
      await mongoose.connection.dropDatabase();
      console.log('🗑️  Database dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping database:', error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();
export default database;

/**
 * Database utility functions
 */
export const dbUtils = {
  /**
   * Check if ObjectId is valid
   */
  isValidObjectId: (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
  },

  /**
   * Convert string to ObjectId
   */
  toObjectId: (id: string): mongoose.Types.ObjectId => {
    return new mongoose.Types.ObjectId(id);
  },

  /**
   * Generate new ObjectId
   */
  generateObjectId: (): mongoose.Types.ObjectId => {
    return new mongoose.Types.ObjectId();
  },

  /**
   * Get database statistics
   */
  getStats: async () => {
    try {
      const stats = await mongoose.connection.db?.stats();
      return {
        database: mongoose.connection.name,
        collections: stats?.collections || 0,
        dataSize: stats?.dataSize || 0,
        storageSize: stats?.storageSize || 0,
        indexes: stats?.indexes || 0,
        indexSize: stats?.indexSize || 0,
        objects: stats?.objects || 0
      };
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error}`);
    }
  }
};

/**
 * Database seeding utilities
 */
export const seedUtils = {
  /**
   * Check if database has been seeded
   */
  isSeeded: async (): Promise<boolean> => {
    try {
      const { User } = await import('../models/User');
      const adminUser = await User.findOne({ role: 'admin' });
      return !!adminUser;
    } catch (error) {
      return false;
    }
  },

  /**
   * Seed initial admin user
   */
  seedAdminUser: async (adminData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const { User } = await import('../models/User');
      
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        console.log('👤 Admin user already exists');
        return existingAdmin;
      }

      const adminUser = new User({
        ...adminData,
        role: 'admin',
        isVerified: true
      });

      await adminUser.save();
      console.log('👤 Admin user created successfully');
      return adminUser;
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      throw error;
    }
  }
};


