/**
 * Core types for the CivicTrack application
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  is_banned: boolean;
  is_verified: boolean;
  default_lat?: number;
  default_lng?: number;
  preferred_radius_km: number;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  latitude: number;
  longitude: number;
  address: string;
  locality?: string;
  reporter_id?: string;
  reporter_name?: string;
  is_anonymous: boolean;
  is_flagged: boolean;
  is_hidden: boolean;
  flag_count: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_admin_id?: string;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

export interface CreateIssueData {
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  locality?: string;
  is_anonymous?: boolean;
  reporter_id?: string;
  reporter_name?: string;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  category?: string;
  status?: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_admin_id?: string;
  admin_notes?: string;
}

export interface IssueImage {
  id: string;
  issue_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  thumbnail_path?: string;
  width?: number;
  height?: number;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface StatusHistory {
  id: string;
  issue_id: string;
  from_status?: string;
  to_status: string;
  comment?: string;
  changed_by_user_id?: string;
  changed_by_name?: string;
  changed_at: Date;
}

export interface IssueFlag {
  id: string;
  issue_id: string;
  flagger_user_id: string;
  reason?: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewed_by_admin_id?: string;
  admin_decision_note?: string;
  created_at: Date;
  updated_at: Date;
  reviewed_at?: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'status_update' | 'flag_result' | 'system' | 'admin_message';
  related_issue_id?: string;
  is_read: boolean;
  is_email_sent: boolean;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query parameters for filtering
export interface IssueFilters {
  status?: string;
  category?: string;
  priority?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  search?: string;
  reporter_id?: string;
  is_flagged?: boolean;
  is_hidden?: boolean;
  created_after?: Date;
  created_before?: Date;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'status' | 'priority';
  sort_order?: 'asc' | 'desc';
}

// Authentication token payload
export interface JwtPayload {
  user_id: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

// Location related types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  locality?: string;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// File upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// Analytics types
export interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolutionRate: number;
  issuesByCategory: Array<{ category: string; count: number }>;
  issuesByStatus: Array<{ status: string; count: number }>;
  topReporters: Array<{ user_id: string; name: string; report_count: number }>;
  monthlyTrends: Array<{ month: string; issues: number; resolved: number }>;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  validationErrors?: ValidationError[];
}
