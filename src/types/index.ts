export interface User {
  id: string;
  _id?: string; // MongoDB ObjectId
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  isVerified: boolean;
  isBanned: boolean;
  defaultLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferredRadiusKm?: number;
  lastLogin?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'reported' | 'in_review' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  location: {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    address: string;
  };
  images: string[];
  reporterId: string;
  reporterName?: string;
  isAnonymous: boolean;
  isFlagged: boolean;
  flaggedReason?: string;
  flaggedBy?: string[];
  flaggedAt?: string;
  flagCount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAdminId?: string;
  adminNotes?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  statusHistory: StatusUpdate[];
}

export interface CreateIssueData {
  title: string;
  description: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  isAnonymous: boolean;
  reporterName?: string;
}

export interface IssueFilters {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  page?: number;
  limit?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_update' | 'flag_result' | 'system' | 'admin_message';
  relatedIssueId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolutionRate: number;
  issuesByCategory: Array<{ category: string; count: number }>;
  issuesByStatus: Array<{ status: string; count: number }>;
  topReporters: Array<{ userId: string; name: string; reportCount: number }>;
  monthlyTrends: Array<{ month: string; issues: number; resolved: number }>;
}

export interface StatusUpdate {
  id: string;
  status: string;
  timestamp: string;
  updatedBy: string;
  comment?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FilterOptions {
  category: string;
  status: string;
  priority: string;
  search: string;
  distance: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
