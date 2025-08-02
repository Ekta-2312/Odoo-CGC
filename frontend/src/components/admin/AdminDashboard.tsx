import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin,
  Eye,
  Search,
  Loader,
  AlertTriangle
} from 'lucide-react';
import { Issue } from '../../types';
import { issuesApi, adminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AdminStats {
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  flaggedIssues: number;
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
}

const statusColors = {
  reported: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_review: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  // Helper function to get issue ID
  const getIssueId = (issue: Issue): string => {
    return issue.id || issue._id || '';
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both stats and issues in parallel
      const [issuesResponse, statsResponse] = await Promise.all([
        issuesApi.getAdminIssues(),
        fetchAdminStats()
      ]);

      if (issuesResponse.success) {
        setIssues(issuesResponse.data || []);
      }
      
      if (statsResponse) {
        setStats(statsResponse);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async (): Promise<AdminStats | null> => {
    try {
      // Since we don't have a dedicated stats endpoint, calculate from available data
      const [issuesResponse, usersResponse] = await Promise.all([
        issuesApi.getIssues(),
        adminApi.getUserStats()
      ]);

      if (issuesResponse.success && usersResponse.success) {
        const allIssues = issuesResponse.data || [];
        const userStats = usersResponse.data;
        
        return {
          totalIssues: allIssues.length,
          pendingIssues: allIssues.filter(issue => issue.status === 'reported').length,
          inProgressIssues: allIssues.filter(issue => issue.status === 'in_progress').length,
          resolvedIssues: allIssues.filter(issue => issue.status === 'resolved').length,
          flaggedIssues: allIssues.filter(issue => issue.isFlagged).length,
          totalUsers: userStats.totalUsers || 0,
          activeUsers: userStats.activeUsers || 0,
          newUsersThisWeek: userStats.newUsers || 0
        };
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
    return null;
  };

  const fetchIssues = async () => {
    try {
      const params: any = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const response = await issuesApi.getAdminIssues(params);
      
      if (response.success) {
        setIssues(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    try {
      setActionLoading(issueId);
      
      const response = await issuesApi.updateIssue(issueId, { status: newStatus });
      
      if (response.success) {
        // Refresh data
        await fetchDashboardData();
        alert(`Issue ${newStatus} successfully!`);
      } else {
        alert(`Failed to update issue status`);
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('Error updating issue status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    
    try {
      setActionLoading(issueId);
      
      const response = await issuesApi.deleteIssue(issueId);
      
      if (response.success) {
        await fetchDashboardData();
        alert('Issue deleted successfully!');
      } else {
        alert('Failed to delete issue');
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Error deleting issue');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage community issues and track platform metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalIssues}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolvedIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="reported">Reported</option>
              <option value="in_review">In Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Issues ({issues.length})</h3>
          </div>
          
          {issues.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">No issues match your current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {issues.map((issue) => (
                <div key={issue.id || issue._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{issue.title}</h3>
                          <p className="text-gray-600 mb-3">{issue.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">{issue.category}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}>
                              {issue.priority}
                            </span>
                            <span>Reporter: {issue.reporterId}</span>
                            <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status as keyof typeof statusColors]}`}>
                              {issue.status.replace('_', ' ')}
                            </span>
                            {issue.isFlagged && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                🚩 Flagged
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{issue.location?.address || 'Location not specified'}</span>
                          </div>

                          <div className="flex space-x-3">
                            {issue.status === 'reported' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(getIssueId(issue), 'in_review')}
                                  disabled={actionLoading === getIssueId(issue)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                  {actionLoading === getIssueId(issue) ? (
                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Eye className="w-4 h-4 mr-2" />
                                  )}
                                  Review
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(getIssueId(issue), 'rejected')}
                                  disabled={actionLoading === getIssueId(issue)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {issue.status === 'in_review' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(getIssueId(issue), 'in_progress')}
                                  disabled={actionLoading === getIssueId(issue)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Start Progress
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(getIssueId(issue), 'rejected')}
                                  disabled={actionLoading === getIssueId(issue)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {issue.status === 'in_progress' && (
                              <button
                                onClick={() => handleStatusUpdate(getIssueId(issue), 'resolved')}
                                disabled={actionLoading === getIssueId(issue)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Resolved
                              </button>
                            )}

                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            
                            <button
                              onClick={() => handleDeleteIssue(getIssueId(issue))}
                              disabled={actionLoading === getIssueId(issue)}
                              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
