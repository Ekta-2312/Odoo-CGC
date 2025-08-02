import { ApiResponse, PaginatedResponse, IssueFilters } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

/**
 * Generic API service for making HTTP requests
 */
class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string> = {};

  constructor(baseURL: string) {
    this.baseURL = baseURL;
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create API service instance
const apiService = new ApiService(API_BASE_URL);

/**
 * Issues API
 */
export const issuesApi = {
  /**
   * Get all issues with optional filters
   */
  getIssues: async (params?: IssueFilters): Promise<PaginatedResponse<any>> => {
    return apiService.get('/issues', params);
  },

  /**
   * Get admin issues (including pending approval)
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
  },

  /**
   * Get user statistics
   */
  getStats: async (userId: string): Promise<ApiResponse<any>> => {
    return apiService.get(`/users/${userId}/stats`);
  }
};

/**
 * Auth API
 */
export const authApi = {
  /**
   * User login
   */
  login: async (email: string, password: string): Promise<ApiResponse<any>> => {
    return apiService.post('/auth/login', { email, password });
  },

  /**
   * User registration
   */
  register: async (userData: any): Promise<ApiResponse<any>> => {
    return apiService.post('/auth/register', userData);
  },

  /**
   * Logout
   */
  logout: async (): Promise<ApiResponse<any>> => {
    return apiService.post('/auth/logout');
  },

  /**
   * Verify token
   */
  verifyToken: async (): Promise<ApiResponse<any>> => {
    return apiService.get('/auth/verify');
  }
};

/**
 * Analytics API
 */
export const analyticsApi = {
  /**
   * Get system analytics
   */
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiService.get('/analytics/stats');
  },

  /**
   * Get user analytics
   */
  getUserStats: async (userId: string): Promise<ApiResponse<any>> => {
    return apiService.get(`/analytics/users/${userId}`);
  }
};

export default apiService;
