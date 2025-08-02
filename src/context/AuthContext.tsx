import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import apiService from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token/session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('civictrack_user');
        const savedToken = localStorage.getItem('civictrack_token');
        
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          apiService.setAuthToken(savedToken);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      const response = await apiService.post<{
        success: boolean;
        token: string;
        data: User;
        message?: string;
      }>('/auth/login', { email, password });

      if (response.success && response.token && response.data) {
        setUser(response.data);
        localStorage.setItem('civictrack_user', JSON.stringify(response.data));
        localStorage.setItem('civictrack_token', response.token);
        apiService.setAuthToken(response.token);
        return true;
      } else {
        console.error('Login failed:', response.message);
        return false;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await apiService.post<{
        success: boolean;
        token: string;
        data: User;
        message?: string;
      }>('/auth/register', userData);

      if (response.success && response.token && response.data) {
        setUser(response.data);
        localStorage.setItem('civictrack_user', JSON.stringify(response.data));
        localStorage.setItem('civictrack_token', response.token);
        apiService.setAuthToken(response.token);
        return true;
      } else {
        console.error('Registration failed:', response.message);
        return false;
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civictrack_user');
    localStorage.removeItem('civictrack_token');
    apiService.removeAuthToken();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
