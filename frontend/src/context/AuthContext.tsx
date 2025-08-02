import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { apiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session and token
    const storedUser = localStorage.getItem('civictrack_user');
    const storedToken = localStorage.getItem('civictrack_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      apiService.setAuthToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        const userData: User = {
          id: result.data.id || result.data._id,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          role: result.data.role,
          createdAt: result.data.createdAt,
          defaultLocation: result.data.defaultLocation,
          preferredRadiusKm: result.data.preferredRadiusKm
        };
        
        setUser(userData);
        localStorage.setItem('civictrack_user', JSON.stringify(userData));
        
        // Store and set the JWT token
        if (result.token) {
          localStorage.setItem('civictrack_token', result.token);
          apiService.setAuthToken(result.token);
        }
        
        setLoading(false);
        return true;
      } else {
        console.error('Login failed:', result.message);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          defaultLocation: userData.defaultLocation
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newUser: User = {
          id: result.data.id || result.data._id,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          role: result.data.role,
          createdAt: result.data.createdAt,
          defaultLocation: result.data.defaultLocation,
          preferredRadiusKm: result.data.preferredRadiusKm
        };
        
        setUser(newUser);
        localStorage.setItem('civictrack_user', JSON.stringify(newUser));
        
        // Store and set the JWT token
        if (result.token) {
          localStorage.setItem('civictrack_token', result.token);
          apiService.setAuthToken(result.token);
        }
        
        setLoading(false);
        return true;
      } else {
        console.error('Registration failed:', result.message);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civictrack_user');
    localStorage.removeItem('civictrack_token');
    apiService.removeAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};