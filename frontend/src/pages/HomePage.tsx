import React, { useState, useMemo, useEffect } from 'react';
import { mockIssues } from '../data/mockData';
import { FilterOptions } from '../types';
import IssueCard from '../components/issues/IssueCard';
import FilterBar from '../components/issues/FilterBar';
import Pagination from '../components/issues/Pagination';
import { MapPin, Plus, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../services/api';

/**
 * HomePage Component - Public landing page showing community issues
 * Available to both logged-in and non-logged-in users
 * Features filtering, search, and pagination
 */
const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    status: 'all',
    distance: 5,
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [issues, setIssues] = useState(mockIssues); // Initialize with mock data
  const [error, setError] = useState<string | null>(null);
  const issuesPerPage = 6;

  // Fetch issues from API when filters change
  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API first
        const response = await issuesApi.getIssues({
          page: currentPage,
          limit: issuesPerPage,
          category: filters.category !== 'all' ? filters.category : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          search: filters.search || undefined,
          radius: filters.distance
        });
        
        if (response.success && response.data) {
          setIssues(response.data);
        } else {
          throw new Error('Failed to fetch issues');
        }
      } catch (err) {
        console.warn('API not available, using mock data:', err);
        // Fallback to mock data if API is not available
        setIssues(mockIssues);
        setError('Using sample data - backend not connected');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [filters, currentPage]);

  // Filter issues based on current filters (for mock data fallback)
  const filteredIssues = useMemo(() => {
    if (issues === mockIssues) {
      // Only apply client-side filtering when using mock data
      const filtered = issues.filter(issue => {
        // Don't show hidden issues to regular users
        if (issue.isHidden && user?.role !== 'admin') {
          return false;
        }

        // Category filter
        if (filters.category !== 'all' && issue.category !== filters.category) {
          return false;
        }
        
        // Status filter
        if (filters.status !== 'all' && issue.status !== filters.status) {
          return false;
        }
        
        // Search filter - search in title and description
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const titleMatch = issue.title.toLowerCase().includes(searchTerm);
          const descriptionMatch = issue.description.toLowerCase().includes(searchTerm);
          const categoryMatch = issue.category.toLowerCase().includes(searchTerm);
          
          if (!titleMatch && !descriptionMatch && !categoryMatch) {
            return false;
          }
        }
        
        return true;
      });
      return filtered;
    }
    // When using API data, return as-is since filtering is done server-side
    return issues;
  }, [filters, user, issues]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredIssues.length / issuesPerPage);
  const startIndex = (currentPage - 1) * issuesPerPage;
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + issuesPerPage);

  // Calculate statistics
  const stats = useMemo(() => {
    const allIssues = issues === mockIssues ? 
      mockIssues.filter(issue => !issue.isHidden || user?.role === 'admin') : 
      issues;
      
    const total = allIssues.length;
    const resolved = allIssues.filter(issue => 
      issue.status === 'resolved'
    ).length;
    const pending = allIssues.filter(issue => 
      issue.status === 'pending'
    ).length;
    const inProgress = allIssues.filter(issue => 
      issue.status === 'in-progress'
    ).length;

    return {
      total,
      resolved,
      pending,
      inProgress,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
    };
  }, [user, issues]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error/Warning Banner */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              CivicTrack
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-2">
              Civic Issues in Your Neighborhood
            </p>
            <p className="text-lg text-blue-200 mb-8 max-w-3xl mx-auto">
              Browse and track civic issues reported by your community. Together, we can make our neighborhoods better through transparent reporting and collaborative problem-solving.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-blue-100 mb-8">
              <MapPin className="h-5 w-5" />
              <span>Showing issues within {filters.distance}km of your location</span>
            </div>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/report"
                  className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Report New Issue</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                >
                  <span>My Dashboard</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Login to Report Issues
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium shadow-lg"
                >
                  Sign Up Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.resolutionRate}%</div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Community Issues
            </h2>
            <p className="text-gray-600 mt-1">
              {isLoading ? (
                <span className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading...
                </span>
              ) : (
                `${filteredIssues.length} issue${filteredIssues.length !== 1 ? 's' : ''} found`
              )}
            </p>
          </div>
          
          {user && (
            <div className="mt-4 sm:mt-0">
              <Link
                to="/map"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <MapPin className="h-4 w-4" />
                <span>View on Map</span>
              </Link>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Issues Grid */}
        {!isLoading && paginatedIssues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && paginatedIssues.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filters.search || filters.category !== 'all' || filters.status !== 'all' ? (
                "No issues match your current filters. Try adjusting your search criteria or clearing filters."
              ) : (
                "No civic issues have been reported in this area yet."
              )}
            </p>
            
            {user ? (
              <Link
                to="/report"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Report First Issue</span>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Join the Community
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors duration-200 font-medium"
                >
                  Already have an account?
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Call to Action Section */}
      {!user && (
        <div className="bg-blue-50 border-t border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Make a Difference?
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of citizens working together to improve their communities. 
                Report issues, track progress, and see real change happen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-lg"
                >
                  Get Started Today
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium text-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
