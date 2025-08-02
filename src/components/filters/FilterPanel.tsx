import React from 'react';
import { Search } from 'lucide-react';
import { FilterOptions } from '../../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key: keyof FilterOptions, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search issues..."
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
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

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
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

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Distance (if location-based filtering) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distance: {filters.distance}km
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={filters.distance}
          onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1km</span>
          <span>50km</span>
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() => onFiltersChange({
          category: 'all',
          status: 'all',
          priority: 'all',
          search: '',
          distance: 5
        })}
        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterPanel;
