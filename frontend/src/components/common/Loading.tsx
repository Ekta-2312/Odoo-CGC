/**
 * @fileoverview Loading Components for CivicTrack
 * Provides various loading indicators and skeleton loaders for better UX
 */

import { Loader2 } from 'lucide-react';

/**
 * Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * Loading Spinner Component
 * Displays a rotating spinner with optional text
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} text-blue-600`} />
      {text && <span className="ml-2 text-gray-600">{text}</span>}
    </div>
  );
};

/**
 * Loading Button Component
 * Button with loading state and spinner
 */
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  onClick,
  disabled,
  className = '',
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading && (
        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
      )}
      {children}
    </button>
  );
};

/**
 * Skeleton Loader for Cards
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="mt-4 flex space-x-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for List Items
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * Map Loading Component
 */
export const MapLoading: React.FC = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading map...</p>
        <p className="text-sm text-gray-500">Please wait while we load the issues</p>
      </div>
    </div>
  );
};

/**
 * Page Loading Component
 */
export const PageLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading...</h2>
        <p className="mt-2 text-gray-600">Please wait while we load your content</p>
      </div>
    </div>
  );
};

/**
 * Table Loading Component
 */
export const TableLoading: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Form Loading Overlay
 */
interface FormLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const FormLoading: React.FC<FormLoadingProps> = ({ 
  loading, 
  children, 
  loadingText = 'Processing...' 
}) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-gray-600">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
};
