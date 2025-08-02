import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../services/api';
import { Issue, FilterOptions } from '../types';
import IssueCard from '../components/issues/IssueCard';
import FilterPanel from '../components/filters/FilterPanel';
import { mockIssues } from '../data/mockData';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    status: 'all',
    priority: 'all',
    search: '',
    distance: 5
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]); // Start with empty array, not mock data
  const [error, setError] = useState<string | null>(null);
  const issuesPerPage = 6;

  // Fetch issues from API when filters change
  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API first
        console.log('Fetching issues from database...');
        const response = await issuesApi.getIssues({
          page: currentPage,
          limit: issuesPerPage,
          category: filters.category !== 'all' ? filters.category : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          search: filters.search || undefined
        });
        
        if (response.success && response.data && Array.isArray(response.data)) {
          console.log(`Successfully loaded ${response.data.length} issues from database`);
          setIssues(response.data);
          setError(null); // Clear any previous errors
        } else {
          console.warn('API response was not successful or no data received');
          setIssues([]);
          setError('No data available from backend');
        }
      } catch (err) {
        console.error('API not available:', err);
        setIssues([]);
        setError('Backend server not available - please ensure the backend is running');
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
      issue.status === 'reported'
    ).length;
    const inProgress = allIssues.filter(issue => 
      issue.status === 'in_progress'
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
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Welcome to CivicTrack
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Report civic issues, track their progress, and help make your community better.
              Join thousands of citizens working together to improve our neighborhoods.
            </p>
            
            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-800">Total Issues</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-green-800">Resolved</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                <div className="text-sm text-yellow-800">In Progress</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.resolutionRate}%</div>
                <div className="text-sm text-purple-800">Resolution Rate</div>
              </div>
            </div>

            {/* Action Buttons */}
            {user ? (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/report"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Report an Issue
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  View Dashboard
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>

          {/* Issues List */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Community Issues
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {isLoading ? 'Loading...' : (
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
            {!isLoading && filteredIssues.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                {user && (
                  <Link
                    to="/report"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Report the First Issue
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredIssues.length > issuesPerPage && (
              <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{startIndex + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(startIndex + issuesPerPage, filteredIssues.length)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{filteredIssues.length}</span>
                      {' '}results
                    </p>
                  </div>
                  
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === currentPage
                              ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
