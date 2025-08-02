import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Bell, Filter, Plus, Map, BarChart3, List } from 'lucide-react';
import { statusColors, categoryLabels } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { issuesApi } from '../../services/api';
import DynamicMap from '../common/DynamicMap';
import DashboardAnalytics from '../common/DashboardAnalytics';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'notifications' | 'analytics' | 'map'>('reports');
  const [statusFilter, setStatusFilter] = useState('');
  const [userIssues, setUserIssues] = useState<any[]>([]);
  const [allIssues, setAllIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch user's issues directly
        const userIssuesResponse = await issuesApi.getIssues({ userId: user.id });
        let userIssuesData: any[] = [];
        if (userIssuesResponse.success) {
          userIssuesData = userIssuesResponse.data || [];
          setUserIssues(userIssuesData);
        }
        
        // Fetch all public issues for map and analytics
        const allIssuesResponse = await issuesApi.getIssues();
        if (allIssuesResponse.success) {
          const allIssuesData = allIssuesResponse.data || [];
          setAllIssues(allIssuesData);
          
          // Generate notifications based on user issues
          generateNotifications(userIssuesData);
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const generateNotifications = (issues: any[]) => {
    const recentNotifications = issues
      .filter(issue => {
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceCreation <= 7; // Last 7 days
      })
      .map(issue => ({
        id: issue._id,
        message: `Your report "${issue.title}" status: ${issue.status.replace('-', ' ')}`,
        timestamp: new Date(issue.updatedAt || issue.createdAt).toLocaleDateString(),
        read: false,
        type: issue.status
      }));
    
    setNotifications(recentNotifications);
  };

  const calculateAnalytics = () => {
    const total = userIssues.length;
    const pending = userIssues.filter(i => i.status === 'pending').length;
    const resolved = userIssues.filter(i => i.status === 'resolved').length;
    const inProgress = userIssues.filter(i => i.status === 'in-progress').length;
    const rejected = userIssues.filter(i => i.status === 'rejected').length;
    
    // Calculate this week vs last week
    const now = new Date();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekIssues = userIssues.filter(issue => 
      new Date(issue.createdAt) >= thisWeekStart
    ).length;
    
    const lastWeekIssues = userIssues.filter(issue => {
      const createdAt = new Date(issue.createdAt);
      return createdAt >= lastWeekStart && createdAt < thisWeekStart;
    }).length;
    
    // Most common category
    const categoryCounts = userIssues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, 'infrastructure'
    );
    
    // Average resolution time (mock calculation)
    const resolvedIssues = userIssues.filter(i => i.status === 'resolved');
    const avgResolutionTime = resolvedIssues.length > 0 ? 
      Math.round(resolvedIssues.reduce((acc, issue) => {
        const days = Math.floor(
          (new Date(issue.updatedAt || issue.createdAt).getTime() - new Date(issue.createdAt).getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        return acc + Math.max(days, 1);
      }, 0) / resolvedIssues.length) : 0;
    
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    return {
      totalIssues: total,
      pendingIssues: pending,
      resolvedIssues: resolved,
      inProgressIssues: inProgress,
      rejectedIssues: rejected,
      thisWeekIssues,
      lastWeekIssues,
      averageResolutionTime: avgResolutionTime,
      mostCommonCategory: categoryLabels[mostCommonCategory as keyof typeof categoryLabels] || mostCommonCategory,
      resolutionRate
    };
  };

  // Filter issues by current user and status
  const filteredIssues = statusFilter 
    ? userIssues.filter(issue => issue.status === statusFilter)
    : userIssues;

  const analytics = calculateAnalytics();

  const mockNotifications = notifications.length > 0 ? notifications : [
    {
      id: '1',
      message: 'Welcome to CivicTrack! Start by reporting your first issue.',
      timestamp: 'Just now',
      read: false,
      type: 'info'
    }
  ];

  const getStatusCounts = () => {
    return {
      pending: userIssues.filter(issue => issue.status === 'pending').length,
      'in-progress': userIssues.filter(issue => issue.status === 'in-progress').length,
      resolved: userIssues.filter(issue => issue.status === 'resolved').length,
      rejected: userIssues.filter(issue => issue.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleIssueClick = (issue: any) => {
    console.log('Issue clicked:', issue);
    // Navigate to issue detail or show modal
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your reported issues, analytics, and notifications</p>
        </div>
        
        <Link
          to="/report"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report New Issue
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{statusCounts.pending}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-600">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{statusCounts['in-progress']}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-600">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{statusCounts.resolved}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-600">Rejected</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{statusCounts.rejected}</p>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              My Reports ({userIssues.length})
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Map className="w-4 h-4 mr-2" />
              Map View
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative flex items-center ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {mockNotifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'reports' ? (
            <div>
              {/* Filter */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <span className="text-sm text-gray-600">
                  {filteredIssues.length} of {userIssues.length} reports
                </span>
              </div>

              {/* Reports List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading your reports...</p>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600 mb-4">
                    {statusFilter ? `No reports with "${statusFilter}" status` : 'You haven\'t reported any issues yet'}
                  </p>
                  <Link
                    to="/report"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Report Your First Issue
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredIssues.map(issue => (
                    <div key={issue.id || issue._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{issue.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${statusColors[issue.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                          {issue.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      {issue.images && issue.images.length > 0 && (
                        <img 
                          src={issue.images[0].startsWith('http') ? issue.images[0] : `http://localhost:3001${issue.images[0]}`} 
                          alt="Issue" 
                          className="w-full h-32 object-cover rounded-md mb-3"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="capitalize">{categoryLabels[issue.category as keyof typeof categoryLabels] || issue.category}</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/issue/${issue.id || issue._id}`}
                          className="flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                        
                        <div className="flex items-center space-x-2">
                          {issue.status === 'pending' && (
                            <>
                              <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'map' ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Issues Map</h3>
                <p className="text-sm text-gray-600">View all your reported issues on the map</p>
              </div>
              <DynamicMap 
                issues={allIssues.filter(issue => issue.location?.latitude && issue.location?.longitude)} 
                height="500px"
                onIssueClick={handleIssueClick}
              />
            </div>
          ) : activeTab === 'analytics' ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Reports Analytics</h3>
                <p className="text-sm text-gray-600">Detailed insights into your reported issues</p>
              </div>
              <DashboardAnalytics data={analytics} />
            </div>
          ) : (
            /* Notifications Tab */
            <div className="space-y-4">
              {mockNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </div>
              ) : (
                mockNotifications.map(notification => (
                  <div key={notification.id} className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className="text-sm text-gray-900 mb-1">{notification.message}</p>
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;