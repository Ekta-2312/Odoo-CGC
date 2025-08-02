import React, { useState, useEffect } from 'react';
import { MapPin, List, Search } from 'lucide-react';
import { Issue } from '../../types';
import { issuesApi } from '../../services/api';
import DynamicMap from '../common/DynamicMap';
import FlagIssueModal from '../common/FlagIssueModal';

const statusColors = {
  reported: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-orange-100 text-orange-800', 
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800'
};

const categories = ['Road Issues', 'Utilities', 'Public Safety', 'Environment', 'Infrastructure', 'Other'];

const MapView: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    distance: 5
  });
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllLocations, setShowAllLocations] = useState(true);
  const [flagModal, setFlagModal] = useState<{isOpen: boolean; issueId: string; issueTitle: string}>({
    isOpen: false,
    issueId: '',
    issueTitle: ''
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, filters, searchTerm]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issuesApi.getIssues();
      console.log('Raw API response:', response);
      console.log('Issues data:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('First issue location:', response.data[0].location);
      }
      setIssues(response.data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];
    
    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }
    
    if (filters.category) {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredIssues(filtered);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="in_review">In Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Distance:</label>
              <select
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1km</option>
                <option value={3}>3km</option>
                <option value={5}>5km</option>
                <option value={10}>10km</option>
              </select>
            </div>
            
            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Fit all locations button */}
            <button
              onClick={() => setShowAllLocations(!showAllLocations)}
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAllLocations ? 'Center Map' : 'Show All'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {viewMode === 'map' ? (
          <>
            {/* Interactive Map */}
            <div className="flex-1 relative">
              {/* Map controls info */}
              <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-lg text-xs text-gray-600">
                <div>🖱️ Scroll to zoom</div>
                <div>🤏 Double-click to zoom in</div>
                <div>📍 Click markers for details</div>
                <div>Issues: {filteredIssues.length}</div>
              </div>
              
              <DynamicMap 
                issues={filteredIssues} 
                height="100%"
                fitBounds={showAllLocations}
                onIssueClick={(issue) => {
                  console.log('Issue clicked:', issue);
                }}
              />
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Issues on Map ({filteredIssues.length})
                </h3>
                
                <div className="space-y-4">
                  {filteredIssues.map(issue => (
                    <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{issue.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[issue.status]}`}>
                          {issue.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{issue.category}</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {issue.images && issue.images.length > 0 && (
                        <div className="mt-2">
                          <img 
                            src={issue.images[0].startsWith('http') ? issue.images[0] : `http://localhost:3001${issue.images[0]}`} 
                            alt="Issue" 
                            className="w-full h-24 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          View Details
                        </button>
                        <button 
                          onClick={() => {
                            console.log('Flag button clicked, issue:', issue); // Debug log
                            setFlagModal({
                              isOpen: true,
                              issueId: issue.id,
                              issueTitle: issue.title
                            });
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          🚩 Flag
                        </button>
                      </div>
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
          </>
        ) : (
          /* List view */
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map(issue => (
                <div key={issue.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {issue.images && issue.images.length > 0 && (
                    <img 
                      src={issue.images[0].startsWith('http') ? issue.images[0] : `http://localhost:3001${issue.images[0]}`} 
                      alt="Issue" 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{issue.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${statusColors[issue.status]}`}>
                        {issue.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{issue.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{issue.category}</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{issue.location?.address || 'Location not specified'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Flag button clicked (list), issue:', issue); // Debug log
                          setFlagModal({
                            isOpen: true,
                            issueId: issue.id,
                            issueTitle: issue.title
                          });
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        🚩 Flag
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredIssues.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                  <p className="text-gray-600">Try adjusting your filters to see more results</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Flag Modal */}
      <FlagIssueModal
        issueId={flagModal.issueId}
        issueTitle={flagModal.issueTitle}
        isOpen={flagModal.isOpen}
        onClose={() => setFlagModal({isOpen: false, issueId: '', issueTitle: ''})}
        onSuccess={() => {
          fetchIssues(); // Refresh issues after flagging
        }}
      />
    </div>
  );
};

export default MapView;