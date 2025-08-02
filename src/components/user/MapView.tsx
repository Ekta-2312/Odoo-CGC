import React, { useState, useEffect } from 'react';
import { MapPin, Filter, List, Map, Search, Locate } from 'lucide-react';
import { issuesApi } from '../../services/api';
import { Issue } from '../../types';
import { statusColors } from '../../data/mockData';
import DynamicMap from '../common/DynamicMap';

const MapView: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priority: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, filters, searchTerm]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      console.log('Fetching issues from API...');
      
      const response = await issuesApi.getIssues();
      console.log('API Response:', response);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        console.log(`Successfully loaded ${response.data.length} issues from database`);
        setIssues(response.data);
      } else {
        console.warn('API response was not successful or no data received');
        setIssues([]); // Start with empty array, not mock data
      }
    } catch (error) {
      console.error('Error fetching issues from database:', error);
      // Only show empty state, don't fall back to mock data
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = issues;

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === filters.priority);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(term) ||
        issue.description.toLowerCase().includes(term) ||
        issue.location.address.toLowerCase().includes(term)
      );
    }

    setFilteredIssues(filtered);
  };

  const handleRefresh = () => {
    fetchIssues();
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(selectedIssue?.id === issue.id ? null : issue);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issues Map</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and explore civic issues in your community ({filteredIssues.length} issues)
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Refresh Data
              </button>
              
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Map className="h-4 w-4 inline mr-2" />
                  Map View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4 inline mr-2" />
                  List View
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>
              
              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Search issues..."
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Roads">Roads</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Vandalism">Vandalism</option>
                  <option value="Waste">Waste</option>
                  <option value="Parks">Parks</option>
                  <option value="Traffic">Traffic</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Safety">Safety</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="reported">Reported</option>
                  <option value="in_review">In Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFilters({ category: 'all', status: 'all', priority: 'all' });
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Real Interactive Leaflet Map */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Locate className="h-5 w-5 mr-2 text-blue-600" />
                      Interactive Issue Map
                    </h3>
                    <div className="text-sm text-gray-600">
                      {filteredIssues.length} issues displayed
                    </div>
                  </div>
                  <DynamicMap 
                    issues={filteredIssues} 
                    height="500px"
                    onIssueClick={handleIssueClick}
                  />
                </div>
                
                {/* Issues List Below Map */}
                <div className="p-6 border-t">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Issues in This Area ({filteredIssues.length})</h4>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {filteredIssues.map(issue => (
                      <div 
                        key={issue.id} 
                        className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                          selectedIssue?.id === issue.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900 text-sm">{issue.title}</h5>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[issue.status]}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {issue.location.address}
                          </span>
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                        {issue.location.lat && issue.location.lng && (
                          <div className="mt-2 text-xs text-blue-600">
                            📍 Coordinates: {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {filteredIssues.length === 0 && (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No issues found with current filters</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredIssues.map(issue => (
                  <div key={issue.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{issue.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {issue.category}
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {issue.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{issue.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{issue.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                        <span>By: {issue.isAnonymous ? 'Anonymous' : issue.reporterName}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredIssues.length === 0 && (
                  <div className="bg-white rounded-lg p-12 text-center">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
