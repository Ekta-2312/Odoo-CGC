import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import database from './config/database';
// Import models to ensure they are registered with Mongoose
import './models/User';
import './models/Issue';
import './models/index';
import { User } from './models/User';
import { Issue } from './models/Issue';
import { Comment } from './models/index';
import { calculateDistance, isWithinRadius } from './utils/geolocation';

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
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static file serving for uploads
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Logging middleware
    this.app.use(morgan('combined'));
  }

  /**
   * Authentication middleware
   */
  private authenticateToken(req: any, res: any, next: any): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      req.user = user;
      next();
    });
  }

  /**
   * Admin authorization middleware
   */
  private requireAdmin(req: any, res: any, next: any): void {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    const apiPrefix = '/api/v1';

    // Configure multer for image uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'));
        }
      }
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'CivicTrack API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Image upload endpoint
    this.app.post(`${apiPrefix}/upload`, upload.array('images', 5), (req, res) => {
      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No files uploaded'
          });
        }

        const imageUrls = files.map(file => `/uploads/${file.filename}`);

        return res.json({
          success: true,
          message: 'Images uploaded successfully',
          data: {
            imageUrls,
            count: files.length
          }
        });
      } catch (error) {
        console.error('Error uploading images:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Authentication endpoints
    this.app.post(`${apiPrefix}/auth/register`, async (req, res) => {
      try {
        const {
          name,
          email,
          phone,
          password,
          defaultLocation
        } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !password || !defaultLocation) {
          return res.status(400).json({
            success: false,
            message: 'All fields are required including location'
          });
        }

        // Validate location fields
        if (!defaultLocation.latitude || !defaultLocation.longitude || !defaultLocation.address) {
          return res.status(400).json({
            success: false,
            message: 'Complete location information is required (latitude, longitude, address)'
          });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [{ email }, { phone }]
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User with this email or phone already exists'
          });
        }

        // Create new user
        const newUser = new User({
          name,
          email,
          phone,
          password, // Will be hashed by the pre-save middleware
          defaultLocation,
          role: 'user',
          isVerified: true // Set to true for demo purposes
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        // Return user without password and include token
        const userResponse = newUser.toJSON();

        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: userResponse,
          token: token
        });

      } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to register user',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.post(`${apiPrefix}/auth/login`, async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            success: false,
            message: 'Email and password are required'
          });
        }

        // Find user by email and include password for verification
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        // Check if user is banned
        if (user.isBanned) {
          return res.status(403).json({
            success: false,
            message: 'Your account has been banned'
          });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user._id,
            email: user.email,
            role: user.role 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        // Return user without password and include token
        const userResponse = user.toJSON();

        return res.json({
          success: true,
          message: 'Login successful',
          data: userResponse,
          token: token
        });

      } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to login',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get user by email (for testing)
    this.app.get(`${apiPrefix}/users/:email`, async (req, res) => {
      try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.json({ success: true, data: user });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    });

    // Create admin user endpoint (for setup)
    this.app.post(`${apiPrefix}/auth/create-admin`, async (req, res) => {
      try {
        const {
          name = 'Admin User',
          email = 'admin@civictrack.com',
          phone = '9876543210',
          password = 'admin123'
        } = req.body;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
          return res.status(400).json({
            success: false,
            message: 'Admin user already exists'
          });
        }

        // Create admin user with default location
        const adminUser = new User({
          name,
          email,
          phone,
          password, // Will be hashed by the pre-save middleware
          role: 'admin',
          isVerified: true,
          defaultLocation: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'New York, NY, USA'
          },
          preferredRadiusKm: 50
        });

        await adminUser.save();

        // Return user without password
        const userResponse = adminUser.toJSON();

        return res.status(201).json({
          success: true,
          message: 'Admin user created successfully',
          data: userResponse
        });

      } catch (error) {
        console.error('Error creating admin user:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create admin user',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Issues endpoints
    this.app.get(`${apiPrefix}/issues`, async (req, res) => {
      try {
        const {
          page = 1,
          limit = 10,
          category,
          status,
          priority,
          search,
          latitude,
          longitude,
          radius,
          userId
        } = req.query;

        const query: any = {};

        // If userId is provided, get user's issues; otherwise get all public issues
        if (userId) {
          query.reportedBy = userId;
        } else {
          // For public access, show all non-flagged issues
          query.isFlagged = { $ne: true };
          // Don't filter by isPublic - let all issues show
        }

        // Add filters only if they're not 'all' or undefined
        if (category && category !== 'all' && category !== 'undefined') {
          query.category = category;
        }
        if (status && status !== 'all' && status !== 'undefined') {
          query.status = status;
        }
        if (priority && priority !== 'all' && priority !== 'undefined') {
          query.priority = priority;
        }
        if (search && search !== 'undefined') {
          query.$text = { $search: search as string };
        }

        console.log('Issues query:', JSON.stringify(query, null, 2));

        // Calculate pagination
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Fetch issues with pagination
        const issues = await Issue.find(query)
          .populate('reportedBy', 'name')
          .populate('assignedTo', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum);

        const total = await Issue.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        console.log(`Found ${issues.length} issues out of ${total} total`);

        res.json({
          success: true,
          data: issues,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        });
      } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch issues',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Admin endpoint to get all issues including pending approval
    this.app.get(`${apiPrefix}/admin/issues`, this.authenticateToken.bind(this), this.requireAdmin.bind(this), async (req, res) => {
      try {
        const {
          page = 1,
          limit = 50,
          category,
          status,
          priority,
          search
        } = req.query;

        const query: any = {};

        // Add filters
        if (category && category !== 'all') {
          query.category = category;
        }
        if (status && status !== 'all') {
          query.status = status;
        }
        if (priority && priority !== 'all') {
          query.priority = priority;
        }
        if (search) {
          query.$text = { $search: search as string };
        }

        // Calculate pagination
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Fetch all issues for admin (including pending approval)
        const issues = await Issue.find(query)
          .populate('reportedBy', 'name email')
          .populate('assignedTo', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean();

        const total = await Issue.countDocuments(query);

        return res.json({
          success: true,
          data: issues,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        });

      } catch (error) {
        console.error('Error fetching admin issues:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch issues',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get single issue
    this.app.get(`${apiPrefix}/issues/:id`, async (req, res) => {
      try {
        const issue = await Issue.findById(req.params.id)
          .populate('reportedBy', 'name email')
          .populate('assignedTo', 'name email');

        if (!issue) {
          return res.status(404).json({
            success: false,
            message: 'Issue not found'
          });
        }

        return res.json({
          success: true,
          data: issue
        });
      } catch (error) {
        console.error('Error fetching issue:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch issue',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Create new issue with location validation
    this.app.post(`${apiPrefix}/issues`, async (req, res) => {
      try {
        const {
          title,
          description,
          category,
          priority,
          location,
          images,
          tags,
          isPublic = true,
          reportedBy // User ID
        } = req.body;

        // Validate required fields
        if (!title || !description || !category || !location || !reportedBy) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields: title, description, category, location, reportedBy'
          });
        }

        // Validate location has required coordinates
        if (!location.latitude || !location.longitude || !location.address) {
          return res.status(400).json({
            success: false,
            message: 'Location must include latitude, longitude, and address'
          });
        }

        // Get user to check their default location
        const user = await User.findById(reportedBy);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Check if user has default location set
        if (!user.defaultLocation || !user.defaultLocation.latitude || !user.defaultLocation.longitude) {
          return res.status(400).json({
            success: false,
            message: 'User must set default location before reporting issues'
          });
        }

        // Calculate distance between user's default location and issue location
        const distance = calculateDistance(
          {
            latitude: user.defaultLocation.latitude,
            longitude: user.defaultLocation.longitude
          },
          {
            latitude: location.latitude,
            longitude: location.longitude
          }
        );

        // Check if issue location is within allowed radius (max 5km)
        const maxAllowedRadius = Math.min(user.preferredRadiusKm || 5, 5); // Max 5km limit
        
        if (distance > maxAllowedRadius) {
          return res.status(400).json({
            success: false,
            message: `Issue location is ${distance.toFixed(2)}km away from your location. You can only report issues within ${maxAllowedRadius}km radius.`,
            data: {
              distance: Math.round(distance * 100) / 100,
              maxAllowed: maxAllowedRadius,
              userLocation: {
                latitude: user.defaultLocation.latitude,
                longitude: user.defaultLocation.longitude,
                address: user.defaultLocation.address
              },
              issueLocation: location
            }
          });
        }

        // Create the issue
        const newIssue = new Issue({
          title,
          description,
          category,
          priority: priority || 'medium',
          location,
          reportedBy,
          images: images || [],
          tags: tags || [],
          isPublic,
          views: 0,
          upvotes: [],
          downvotes: []
        });

        await newIssue.save();

        // Populate the reportedBy field for response
        await newIssue.populate('reportedBy', 'name email');

        return res.status(201).json({
          success: true,
          message: 'Issue created successfully',
          data: newIssue
        });

      } catch (error) {
        console.error('Error creating issue:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create issue',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Update issue status (for admin use)
    this.app.put(`${apiPrefix}/issues/:id`, this.authenticateToken.bind(this), this.requireAdmin.bind(this), async (req, res) => {
      try {
        const { id } = req.params;
        const { status, priority, tags } = req.body;

        // Validate status if provided
        const validStatuses = ['reported', 'in_review', 'in_progress', 'resolved', 'closed', 'rejected'];
        if (status && !validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
          });
        }

        // Find and update the issue
        const updateData: any = {};
        if (status) {
          updateData.status = status;
          // When admin approves, move from 'reported' to 'in_review' or 'in_progress'
          if (status === 'in_progress' || status === 'in_review') {
            updateData.reviewedAt = new Date();
          }
        }
        if (priority) updateData.priority = priority;
        if (tags) updateData.tags = tags;

        const updatedIssue = await Issue.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).populate('reportedBy', 'name email');

        if (!updatedIssue) {
          return res.status(404).json({
            success: false,
            message: 'Issue not found'
          });
        }

        return res.json({
          success: true,
          message: 'Issue updated successfully',
          data: updatedIssue
        });

      } catch (error) {
        console.error('Error updating issue:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update issue',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Flag issue endpoint
    this.app.post(`${apiPrefix}/issues/:id/flag`, async (req, res) => {
      try {
        const { id } = req.params;
        const { reason, reportedBy } = req.body;

        if (!reason || !reportedBy) {
          return res.status(400).json({
            success: false,
            message: 'Flag reason and reporter ID are required'
          });
        }

        const issue = await Issue.findByIdAndUpdate(
          id,
          {
            isFlagged: true,
            flaggedReason: reason,
            flaggedBy: reportedBy,
            flaggedAt: new Date()
          },
          { new: true, runValidators: true }
        );

        if (!issue) {
          return res.status(404).json({
            success: false,
            message: 'Issue not found'
          });
        }

        return res.json({
          success: true,
          message: 'Issue flagged successfully',
          data: issue
        });

      } catch (error) {
        console.error('Error flagging issue:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to flag issue',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Delete issue endpoint (Admin only)
    this.app.delete(`${apiPrefix}/issues/:id`, this.authenticateToken.bind(this), this.requireAdmin.bind(this), async (req, res) => {
      try {
        const { id } = req.params;

        // Find and delete the issue
        const deletedIssue = await Issue.findByIdAndDelete(id);

        if (!deletedIssue) {
          return res.status(404).json({
            success: false,
            message: 'Issue not found'
          });
        }

        return res.json({
          success: true,
          message: 'Issue deleted successfully'
        });

      } catch (error) {
        console.error('Error deleting issue:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete issue',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Analytics endpoint
    this.app.get(`${apiPrefix}/analytics/stats`, async (req, res) => {
      try {
        const totalIssues = await Issue.countDocuments({});
        const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
        const pendingIssues = await Issue.countDocuments({ status: 'reported' });
        const inProgressIssues = await Issue.countDocuments({ 
          status: { $in: ['in_review', 'in_progress'] }
        });
        const rejectedIssues = await Issue.countDocuments({ status: 'rejected' });
        const flaggedIssues = await Issue.countDocuments({ isFlagged: true });

        // Category statistics
        const categoryStats = await Issue.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        // Status distribution
        const statusStats = await Issue.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        // Monthly trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyTrends = await Issue.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo } } },
          { 
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              issues: { $sum: 1 },
              resolved: { 
                $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
              }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Top reporters
        const topReporters = await Issue.aggregate([
          { $match: { reportedBy: { $exists: true } } },
          { 
            $group: {
              _id: '$reportedBy',
              reportCount: { $sum: 1 }
            }
          },
          { 
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          { 
            $project: {
              name: '$user.name',
              email: '$user.email',
              reportCount: 1
            }
          },
          { $sort: { reportCount: -1 } },
          { $limit: 10 }
        ]);

        res.json({
          success: true,
          data: {
            overview: {
              total: totalIssues,
              resolved: resolvedIssues,
              pending: pendingIssues,
              inProgress: inProgressIssues,
              rejected: rejectedIssues,
              flagged: flaggedIssues,
              resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0
            },
            categories: categoryStats,
            statusDistribution: statusStats,
            monthlyTrends: monthlyTrends,
            topReporters: topReporters
          }
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch analytics',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // User management endpoints
    this.app.get(`${apiPrefix}/admin/users`, this.authenticateToken.bind(this), this.requireAdmin.bind(this), async (req, res) => {
      try {
        const {
          page = 1,
          limit = 20,
          search,
          status,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;

        const query: any = {};

        // Search filter
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ];
        }

        // Status filter
        if (status === 'banned') {
          query.isBanned = true;
        } else if (status === 'active') {
          query.isBanned = false;
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

        const users = await User.find(query)
          .select('-password -verificationToken -resetPasswordToken')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean();

        // Get issue counts for each user
        const usersWithStats = await Promise.all(
          users.map(async (user) => {
            const reportCount = await Issue.countDocuments({ reportedBy: user._id });
            return {
              ...user,
              id: user._id,
              reportCount,
              joinDate: user.createdAt,
              lastActive: user.lastLogin || user.createdAt
            };
          })
        );

        const total = await User.countDocuments(query);

        res.json({
          success: true,
          data: usersWithStats,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch users',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Ban/unban user endpoint
    this.app.patch(`${apiPrefix}/admin/users/:id/ban`, this.authenticateToken.bind(this), this.requireAdmin.bind(this), async (req, res) => {
      try {
        const { id } = req.params;
        const { isBanned, reason } = req.body;

        const user = await User.findByIdAndUpdate(
          id,
          { 
            isBanned: isBanned,
            ...(reason && { banReason: reason }),
            ...(isBanned && { bannedAt: new Date() })
          },
          { new: true, select: '-password' }
        );

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        return res.json({
          success: true,
          message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
          data: user
        });
      } catch (error) {
        console.error('Error updating user ban status:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update user status',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get flagged issues endpoint
    this.app.get(`${apiPrefix}/admin/flagged`, this.authenticateToken.bind(this), this.requireAdmin.bind(this), async (req, res) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortBy = 'flaggedAt',
          sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

        const flaggedIssues = await Issue.find({ isFlagged: true })
          .populate('reportedBy', 'name email')
          .populate('flaggedBy', 'name email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean();

        const total = await Issue.countDocuments({ isFlagged: true });

        res.json({
          success: true,
          data: flaggedIssues.map(issue => ({
            ...issue,
            id: issue._id
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        });
      } catch (error) {
        console.error('Error fetching flagged issues:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch flagged issues',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // User statistics endpoint
    this.app.get(`${apiPrefix}/admin/users/stats`, this.authenticateToken.bind(this), this.requireAdmin.bind(this), async (req, res) => {
      try {
        const totalUsers = await User.countDocuments({});
        const activeUsers = await User.countDocuments({ isBanned: false });
        const bannedUsers = await User.countDocuments({ isBanned: true });
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        
        // Users joined in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({ 
          createdAt: { $gte: thirtyDaysAgo }
        });

        // Most active users (by report count)
        const activeReporters = await Issue.aggregate([
          { $match: { reportedBy: { $exists: true } } },
          { 
            $group: {
              _id: '$reportedBy',
              reportCount: { $sum: 1 }
            }
          },
          { 
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          { 
            $project: {
              name: '$user.name',
              email: '$user.email',
              reportCount: 1
            }
          },
          { $sort: { reportCount: -1 } },
          { $limit: 5 }
        ]);

        res.json({
          success: true,
          data: {
            totalUsers,
            activeUsers,
            bannedUsers,
            verifiedUsers,
            newUsers,
            activeReporters
          }
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch user statistics',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    });

    // Global error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Global error handler:', err);
      
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal server error';
      
      res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      console.log('🔄 Starting CivicTrack API server...');
      
      // Connect to MongoDB
      await database.connect();
      console.log('✅ Database connection established');

      // Start HTTP server
      this.app.listen(this.port, () => {
        console.log(`🚀 CivicTrack API server started`);
        console.log(`📍 Server running on http://localhost:${this.port}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        console.log(`📋 API base URL: http://localhost:${this.port}/api/v1`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async stop(): Promise<void> {
    try {
      console.log('🛑 Shutting down server...');
      await database.disconnect();
      console.log('✅ Server shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

// Create and start server
const server = new Server();

// Handle process termination
process.on('SIGINT', async () => {
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.stop();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  server.start().catch(console.error);
}

export default server;
