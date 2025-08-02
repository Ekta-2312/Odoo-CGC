import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Issue Interface extending MongoDB Document
 */
export interface IIssue extends Document {
  _id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'environment' | 'safety' | 'utilities' | 'transportation' | 'housing' | 'health' | 'education' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_review' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    district?: string;
    ward?: string;
  };
  reportedBy: mongoose.Types.ObjectId; // Reference to User
  assignedTo?: mongoose.Types.ObjectId; // Reference to Admin User
  images: string[]; // Array of image URLs
  upvotes: mongoose.Types.ObjectId[]; // Array of User IDs who upvoted
  downvotes: mongoose.Types.ObjectId[]; // Array of User IDs who downvoted
  views: number;
  isVerified: boolean;
  estimatedResolutionDate?: Date;
  actualResolutionDate?: Date;
  resolutionNotes?: string;
  tags: string[];
  isPublic: boolean;
  isFlagged: boolean;
  flaggedReason?: string;
  flaggedBy?: mongoose.Types.ObjectId;
  flaggedAt?: Date;
  metadata: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Issue Schema Definition
 */
const issueSchema = new Schema<IIssue>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['infrastructure', 'environment', 'safety', 'utilities', 'transportation', 'housing', 'health', 'education', 'other'],
      message: 'Invalid category'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Invalid priority level'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['reported', 'in_review', 'in_progress', 'resolved', 'closed', 'rejected'],
      message: 'Invalid status'
    },
    default: 'reported'
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    district: String,
    ward: String
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  images: [{
    type: String,
    validate: {
      validator: function(url: string) {
        // Accept both full URLs and relative paths
        return /^(https?:\/\/.+\.(jpg|jpeg|png|gif|webp)|\/uploads\/.+\.(jpg|jpeg|png|gif|webp))$/i.test(url);
      },
      message: 'Invalid image URL format'
    }
  }],
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  estimatedResolutionDate: Date,
  actualResolutionDate: Date,
  resolutionNotes: {
    type: String,
    maxlength: [1000, 'Resolution notes cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flaggedReason: {
    type: String,
    maxlength: [500, 'Flagged reason cannot exceed 500 characters']
  },
  flaggedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: Date,
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
issueSchema.index({ 'location.latitude': 1, 'location.longitude': 1 }); // Geospatial queries
issueSchema.index({ category: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ updatedAt: -1 });
issueSchema.index({ isPublic: 1, isFlagged: 1 });
issueSchema.index({ tags: 1 });
issueSchema.index({ views: -1 });

// Text search index
issueSchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  tags: 'text'
});

// Compound index for filtering
issueSchema.index({ 
  category: 1, 
  status: 1, 
  priority: 1, 
  createdAt: -1 
});

// Virtual for upvote count
issueSchema.virtual('upvoteCount').get(function() {
  return this.upvotes ? this.upvotes.length : 0;
});

// Virtual for downvote count
issueSchema.virtual('downvoteCount').get(function() {
  return this.downvotes ? this.downvotes.length : 0;
});

// Virtual for net votes (upvotes - downvotes)
issueSchema.virtual('netVotes').get(function() {
  const upvoteCount = this.upvotes ? this.upvotes.length : 0;
  const downvoteCount = this.downvotes ? this.downvotes.length : 0;
  return upvoteCount - downvoteCount;
});

// Virtual for days since reported
issueSchema.virtual('daysSinceReported').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for is resolved
issueSchema.virtual('isResolved').get(function() {
  return this.status === 'resolved' || this.status === 'closed';
});

// Virtual for reporter info (populated)
issueSchema.virtual('reporter', {
  ref: 'User',
  localField: 'reportedBy',
  foreignField: '_id',
  justOne: true
});

// Virtual for assignee info (populated)
issueSchema.virtual('assignee', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to update timestamps and validate data
issueSchema.pre('save', function(next) {
  // Auto-set resolution date when status changes to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.actualResolutionDate) {
    this.actualResolutionDate = new Date();
  }
  
  // Clear resolution date if status changes from resolved
  if (this.isModified('status') && this.status !== 'resolved' && this.actualResolutionDate) {
    this.actualResolutionDate = undefined as any;
  }
  
  // Auto-set flagged date
  if (this.isModified('isFlagged') && this.isFlagged && !this.flaggedAt) {
    this.flaggedAt = new Date();
  }
  
  // Clear flagged data if unflagged
  if (this.isModified('isFlagged') && !this.isFlagged) {
    this.flaggedAt = undefined as any;
    this.flaggedReason = undefined as any;
    this.flaggedBy = undefined as any;
  }
  
  next();
});

// Static method to find nearby issues
issueSchema.statics.findNearby = function(latitude: number, longitude: number, radiusKm: number = 5) {
  // Simple radius calculation (for more precise geospatial queries, use MongoDB's geospatial features)
  const radiusInDegrees = radiusKm / 111; // Approximate conversion
  
  return this.find({
    'location.latitude': {
      $gte: latitude - radiusInDegrees,
      $lte: latitude + radiusInDegrees
    },
    'location.longitude': {
      $gte: longitude - radiusInDegrees,
      $lte: longitude + radiusInDegrees
    },
    isPublic: true,
    isFlagged: false
  });
};

// Instance method to check if user has voted
issueSchema.methods.hasUserVoted = function(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const hasUpvoted = this.upvotes.some((id: mongoose.Types.ObjectId) => id.equals(userObjectId));
  const hasDownvoted = this.downvotes.some((id: mongoose.Types.ObjectId) => id.equals(userObjectId));
  
  if (hasUpvoted) return 'upvote';
  if (hasDownvoted) return 'downvote';
  return null;
};

// Instance method to toggle vote
issueSchema.methods.toggleVote = function(userId: string, voteType: 'upvote' | 'downvote') {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  // Remove from both arrays first
  this.upvotes = this.upvotes.filter((id: mongoose.Types.ObjectId) => !id.equals(userObjectId));
  this.downvotes = this.downvotes.filter((id: mongoose.Types.ObjectId) => !id.equals(userObjectId));
  
  // Add to appropriate array
  if (voteType === 'upvote') {
    this.upvotes.push(userObjectId);
  } else {
    this.downvotes.push(userObjectId);
  }
  
  return this.save();
};

// Virtual for id
issueSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Transform output
issueSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Issue: Model<IIssue> = mongoose.model<IIssue>('Issue', issueSchema);
