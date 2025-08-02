import React, { useState, useEffect } from 'react';
import { Flag, AlertTriangle, Eye, Check, X, Clock } from 'lucide-react';
import { Issue } from '../../types';
import { issuesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FlaggedReportsAdmin: React.FC = () => {
  const { user } = useAuth();
  const [flaggedIssues, setFlaggedIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchFlaggedIssues();
  }, []);

  const fetchFlaggedIssues = async () => {
    try {
      setLoading(true);
      const response = await issuesApi.getIssues();
      if (response.success) {
        // Filter flagged issues
        const flagged = response.data?.filter((issue: Issue) => issue.isFlagged) || [];
        setFlaggedIssues(flagged);
      }
    } catch (error) {
      console.error('Error fetching flagged issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (issueId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(issueId);
      
      const updateData = action === 'approve' 
        ? { isFlagged: false }
        : { status: 'rejected' };

      const response = await issuesApi.updateIssue(issueId, updateData);
      
      if (response.success) {
        setFlaggedIssues(prev => prev.filter(issue => issue.id !== issueId));
        alert(`Issue ${action}d successfully!`);
      } else {
        alert(`Failed to ${action} issue`);
      }
    } catch (error) {
      console.error(`Error ${action}ing issue:`, error);
      alert(`Error ${action}ing issue`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flagged reports...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Flagged Reports Review</h1>
              <p className="text-gray-600">Review and moderate reports flagged by users</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{flaggedIssues.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Flagged Issues List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {flaggedIssues.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged reports</h3>
              <p className="text-gray-600">All reports are currently clean. Great job!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {flaggedIssues.map((issue) => (
                <div key={issue.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Flag className="w-6 h-6 text-red-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{issue.title}</h3>
                          <p className="text-gray-600 mb-3">{issue.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">{issue.category}</span>
                            <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {issue.status}
                            </span>
                          </div>

                          {issue.images && issue.images.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Attached Images:</p>
                              <div className="grid grid-cols-3 gap-2">
                                {issue.images.slice(0, 3).map((image, index) => (
                                  <img 
                                    key={index}
                                    src={image.startsWith('http') ? image : `http://localhost:3001${image}`}
                                    alt={`Issue image ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleAction(issue.id, 'approve')}
                              disabled={actionLoading === issue.id}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {actionLoading === issue.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              Approve & Unflag
                            </button>
                            
                            <button
                              onClick={() => handleAction(issue.id, 'reject')}
                              disabled={actionLoading === issue.id}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              {actionLoading === issue.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <X className="w-4 h-4 mr-2" />
                              )}
                              Reject Issue
                            </button>

                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
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

export default FlaggedReportsAdmin;
