import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Eye, Flag, User, Camera } from 'lucide-react';
import { Issue } from '../../types';
import { statusColors } from '../../data/mockData';

interface IssueCardProps {
  issue: Issue;
}

/**
 * IssueCard Component - Displays individual issue information in a card format
 * Shows key details like title, status, location, and reporter info
 */
const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200 ${getPriorityColor(issue.priority || 'medium')}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {issue.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {issue.category}
              </span>
            </div>
          </div>
          {issue.isFlagged && (
            <div className="flex-shrink-0 ml-2" title="This issue has been flagged">
              <Flag className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {issue.description}
        </p>

        {/* Images Preview */}
        {issue.images && issue.images.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Camera className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {issue.images.length} image{issue.images.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate">
            {issue.location.address}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {/* Reporter Info */}
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>
                {issue.isAnonymous ? 'Anonymous' : (issue.reporterName || 'Unknown')}
              </span>
            </div>
            
            {/* Created Date */}
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
          </div>

          {/* View Details Link */}
          <Link
            to={`/issue/${issue.id}`}
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </Link>
        </div>

        {/* Priority Indicator */}
        {issue.priority && issue.priority !== 'medium' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              issue.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              issue.priority === 'low' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
