import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * StatusHistory Interface - Track status changes of issues
 */
export interface IStatusHistory extends Document {
  _id: string;
  issueId: mongoose.Types.ObjectId;
  previousStatus: string;
  newStatus: string;
  changedBy: mongoose.Types.ObjectId;
  changeReason?: string;
  metadata?: {
    estimatedResolutionDate?: Date;
    assignedTo?: mongoose.Types.ObjectId;
    priority?: string;
  };
  createdAt: Date;
}

/**
 * StatusHistory Schema
 */
const statusHistorySchema = new Schema<IStatusHistory>({
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: [true, 'Issue ID is required']
  },
  previousStatus: {
    type: String,
    required: [true, 'Previous status is required']
  },
  newStatus: {
    type: String,
    required: [true, 'New status is required']
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Changed by user is required']
  },
  changeReason: {
    type: String,
    maxlength: [500, 'Change reason cannot exceed 500 characters']
  },
  metadata: {
    estimatedResolutionDate: Date,
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    priority: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes
statusHistorySchema.index({ issueId: 1, createdAt: -1 });
statusHistorySchema.index({ changedBy: 1 });
statusHistorySchema.index({ newStatus: 1 });

export const StatusHistory: Model<IStatusHistory> = mongoose.model<IStatusHistory>('StatusHistory', statusHistorySchema);

/**
 * Notification Interface
 */
export interface INotification extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  type: 'issue_update' | 'issue_assigned' | 'issue_resolved' | 'issue_commented' | 'system_announcement' | 'account_update';
  title: string;
  message: string;
  relatedIssueId?: mongoose.Types.ObjectId;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    actionUrl?: string;
    actorUserId?: mongoose.Types.ObjectId;
    previousStatus?: string;
    newStatus?: string;
  };
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification Schema
 */
const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: {
      values: ['issue_update', 'issue_assigned', 'issue_resolved', 'issue_commented', 'system_announcement', 'account_update'],
      message: 'Invalid notification type'
    },
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  relatedIssueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Invalid priority level'
    },
    default: 'medium'
  },
  metadata: {
    actionUrl: String,
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    previousStatus: String,
    newStatus: String
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);

/**
 * Comment Interface for issues
 */
export interface IComment extends Document {
  _id: string;
  issueId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  isOfficial: boolean; // For admin/official responses
  attachments?: string[]; // Image URLs
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId; // For replies
  likes: mongoose.Types.ObjectId[]; // Users who liked
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Comment Schema
 */
const commentSchema = new Schema<IComment>({
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: [true, 'Issue ID is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [1, 'Content cannot be empty'],
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/i.test(url);
      },
      message: 'Invalid attachment URL format'
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ issueId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ isDeleted: 1, isOfficial: 1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);

/**
 * Analytics Interface for tracking system metrics
 */
export interface IAnalytics extends Document {
  _id: string;
  date: Date;
  metrics: {
    totalIssues: number;
    newIssues: number;
    resolvedIssues: number;
    inProgressIssues: number;
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    categoryBreakdown: {
      [key: string]: number;
    };
    priorityBreakdown: {
      [key: string]: number;
    };
    averageResolutionTime: number; // in hours
    userEngagement: {
      totalViews: number;
      totalVotes: number;
      totalComments: number;
    };
  };
  calculatedAt: Date;
}

/**
 * Analytics Schema
 */
const analyticsSchema = new Schema<IAnalytics>({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  metrics: {
    totalIssues: { type: Number, default: 0 },
    newIssues: { type: Number, default: 0 },
    resolvedIssues: { type: Number, default: 0 },
    inProgressIssues: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    categoryBreakdown: { type: Map, of: Number },
    priorityBreakdown: { type: Map, of: Number },
    averageResolutionTime: { type: Number, default: 0 },
    userEngagement: {
      totalViews: { type: Number, default: 0 },
      totalVotes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 }
    }
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Index on date for efficient queries
analyticsSchema.index({ date: -1 });

export const Analytics: Model<IAnalytics> = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
