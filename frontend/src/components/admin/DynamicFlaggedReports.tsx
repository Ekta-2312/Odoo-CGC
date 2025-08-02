import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, CheckCircle, XCircle, MoreVertical, Loader, Search } from 'lucide-react';
import { adminApi } from '../../services/api';

interface FlaggedIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: string;
  reportedBy: string;
  createdAt: string;
  status: string;
  flagReason: string;
  flaggedAt: string;
  flaggedBy: string;
  images?: string[];
}

const DynamicFlaggedReports: React.FC = () => {
  const [flaggedIssues, setFlaggedIssues] = useState<FlaggedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchFlaggedIssues();
  }, [currentPage, statusFilter, priorityFilter, searchTerm]);

  const fetchFlaggedIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getFlaggedIssues({
        page: currentPage,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.success) {
        setFlaggedIssues(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
        }
      } else {
        setError(response.message || 'Failed to fetch flagged reports');
      }
    } catch (err) {
      setError('Failed to load flagged reports');
      console.error('Flagged issues fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (issueId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(issueId);
      
      // This would be implemented in the backend
      // For now, just simulate the action
      setTimeout(() => {
        setFlaggedIssues(prev => 
          prev.map(issue => 
            issue.id === issueId 
              ? { ...issue, status: action === 'approve' ? 'approved' : 'rejected' }
              : issue
          )
        );
        setActionLoading(null);
      }, 1000);
      
    } catch (error) {
      console.error('Error handling action:', error);
      alert('Error performing action');
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'flagged': return 'text-red-600 bg-red-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-gray-600 bg-gray-100';
      case 'under-review': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && flaggedIssues.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading flagged reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && flaggedIssues.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Reports</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchFlaggedIssues}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Flagged Reports</h1>
        <p className="text-gray-600">Review and moderate flagged content</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search flagged reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="flagged">Flagged</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <button
            onClick={fetchFlaggedIssues}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Flagged Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flag Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flaggedIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">{issue.title}</div>
                      <div className="text-sm text-gray-500 truncate">{issue.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {issue.category} • {issue.location}
                      </div>
                      <div className="text-xs text-gray-400">
                        Reported by: {issue.reportedBy}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{issue.flagReason}</div>
                    <div className="text-xs text-gray-500">
                      Flagged: {new Date(issue.flaggedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      By: {issue.flaggedBy}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAction(issue.id, 'approve')}
                        disabled={actionLoading === issue.id || issue.status !== 'flagged'}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === issue.id ? (
                          <Loader className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        Approve
                      </button>
                      
                      <button
                        onClick={() => handleAction(issue.id, 'reject')}
                        disabled={actionLoading === issue.id || issue.status !== 'flagged'}
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </button>
                      
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {flaggedIssues.length === 0 && !loading && (
          <div className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged reports found</h3>
            <p className="text-gray-600">All reports are currently clean or try adjusting your filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicFlaggedReports;
