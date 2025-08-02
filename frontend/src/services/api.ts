/**
 * API Configuration and Base Service
 * Handles HTTP requests and response formatting
 */

import { ApiResponse, PaginatedResponse } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
}

/**
 * API Service class for handling HTTP requests
 */
class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * Make HTTP request
   */
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      params
    } = config;

    const url = this.buildURL(endpoint, params);
    
    const requestConfig: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Remove Content-Type header for FormData (browser will set it)
        delete requestConfig.headers!['Content-Type'];
        requestConfig.body = body;
      } else {
        requestConfig.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, { method: 'POST', body: formData });
  }

  /**
   * Upload multiple files
   */
  async uploadFiles<T>(endpoint: string, files: File[], additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, { method: 'POST', body: formData });
  }
}

// Export singleton instance
export const apiService = new ApiService();

/**
 * Issues API
 */
export const issuesApi = {
  /**
   * Get all issues with filtering and pagination (approved only for users)
   */
  getIssues: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    userId?: string;
  }): Promise<PaginatedResponse<any>> => {
    return apiService.get('/issues', params);
  },

  /**
   * Get all issues for admin (including pending approval)
   */
  getAdminIssues: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<PaginatedResponse<any>> => {
    return apiService.get('/admin/issues', params);
  },

  /**
   * Get issue by ID
   */
  getIssue: async (id: string): Promise<ApiResponse<any>> => {
    return apiService.get(`/issues/${id}`);
  },

  /**
   * Create new issue
   */
  createIssue: async (issueData: any): Promise<ApiResponse<any>> => {
    return apiService.post('/issues', issueData);
  },

  /**
   * Update issue
   */
  updateIssue: async (id: string, issueData: any): Promise<ApiResponse<any>> => {
    return apiService.put(`/issues/${id}`, issueData);
  },

  /**
   * Delete issue
   */
  deleteIssue: async (id: string): Promise<ApiResponse<any>> => {
    return apiService.delete(`/issues/${id}`);
  },

  /**
   * Vote on issue
   */
  voteIssue: async (id: string, voteType: 'upvote' | 'downvote'): Promise<ApiResponse<any>> => {
    return apiService.post(`/issues/${id}/vote`, { voteType });
  },

  /**
   * Flag issue
   */
  flagIssue: async (id: string, reason: string, reportedBy: string): Promise<ApiResponse<any>> => {
    return apiService.post(`/issues/${id}/flag`, { reason, reportedBy });
  },

  /**
   * Upload images
   */
  uploadImages: async (files: FileList): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    
    // Use the API base URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }
};

/**
 * Users API
 */
export const usersApi = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<any>> => {
    return apiService.get('/users/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: any): Promise<ApiResponse<any>> => {
    return apiService.put('/users/profile', userData);
  }
};

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<ApiResponse<any>> => {
    return apiService.post('/auth/login', { email, password });
  },

  /**
   * Register user
   */
  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<ApiResponse<any>> => {
    return apiService.post('/auth/register', userData);
  },

  /**
   * Logout user
   */
  logout: async (): Promise<ApiResponse<any>> => {
    return apiService.post('/auth/logout');
  },

  /**
   * Refresh token
   */
  refreshToken: async (): Promise<ApiResponse<any>> => {
    return apiService.post('/auth/refresh');
  }
};

/**
 * Analytics API
 */
export const analyticsApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiService.get('/analytics/stats');
  },

  /**
   * Get issue analytics
   */
  getIssueAnalytics: async (period?: string): Promise<ApiResponse<any>> => {
    return apiService.get('/analytics/issues', period ? { period } : {});
  }
};

/**
 * Admin API
 */
export const adminApi = {
  /**
   * Get all users for admin management
   */
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<any>> => {
    return apiService.get('/admin/users', params);
  },

  /**
   * Ban or unban a user
   */
  updateUserBanStatus: async (userId: string, isBanned: boolean, reason?: string): Promise<ApiResponse<any>> => {
    return apiService.patch(`/admin/users/${userId}/ban`, { isBanned, reason });
  },

  /**
   * Get flagged issues
   */
  getFlaggedIssues: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<any>> => {
    return apiService.get('/admin/flagged', params);
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<ApiResponse<any>> => {
    return apiService.get('/admin/users/stats');
  },

  /**
   * Get all issues for admin (including flagged)
   */
  getAllIssues: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<ApiResponse<any>> => {
    return apiService.get('/admin/issues', params);
  }
};

/**
 * Error handling utilities
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Response type guards
 */
export const isApiResponse = <T>(response: any): response is ApiResponse<T> => {
  return response && typeof response.success === 'boolean';
};

export const isPaginatedResponse = <T>(response: any): response is PaginatedResponse<T> => {
  return isApiResponse(response) && response.pagination && Array.isArray(response.data);
};

/**
 * Mock API responses for development
 * Remove this when backend is ready
 */
export const mockApiResponse = <T>(data: T, delay: number = 500): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data,
        message: 'Success'
      });
    }, delay);
  });
};

export const mockPaginatedResponse = <T>(
  data: T[],
  page: number = 1,
  limit: number = 10,
  delay: number = 500
): Promise<PaginatedResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = data.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = data.slice(startIndex, startIndex + limit);

      resolve({
        success: true,
        data: paginatedData,
        message: 'Success',
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    }, delay);
  });
};
