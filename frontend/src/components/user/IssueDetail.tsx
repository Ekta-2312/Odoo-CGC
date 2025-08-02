import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Flag, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mockIssues, statusColors } from '../../data/mockData';

const IssueDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const issue = mockIssues.find(issue => issue.id === id);

  if (!issue) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h2>
          <button
            onClick={() => navigate('/map')}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Map
          </button>
        </div>
      </div>
    );
  }

  const handleFlag = () => {
    setFlagged(true);
    // In a real app, this would make an API call
    setTimeout(() => setFlagged(false), 3000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % issue.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + issue.images.length) % issue.images.length);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-500 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusColors[issue.status]}`}>
                  {issue.status.replace('-', ' ')}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">{issue.category}</span>
              </div>
            </div>
            
            <button
              onClick={handleFlag}
              disabled={flagged}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                flagged 
                  ? 'bg-green-100 text-green-800' 
                  : 'text-red-600 hover:bg-red-50 border border-red-200'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>{flagged ? 'Flagged' : 'Flag as Spam'}</span>
            </button>
          </div>
        </div>

        {/* Images */}
        {issue.images.length > 0 && (
          <div className="relative">
            <img
              src={issue.images[currentImageIndex]}
              alt={`Issue image ${currentImageIndex + 1}`}
              className="w-full h-64 md:h-96 object-cover cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />
            
            {issue.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {issue.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{issue.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
              <div className="flex items-start space-x-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{issue.location.address}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Reported By</h3>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{issue.isAnonymous ? 'Anonymous' : issue.reporterName}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Date Reported</h3>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Last Updated</h3>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(issue.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
            <div className="space-y-4">
              {issue.statusHistory.map((status, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    status.status === 'resolved' ? 'bg-green-500' :
                    status.status === 'in-progress' ? 'bg-blue-500' :
                    status.status === 'rejected' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 capitalize">
                        {status.status.replace('-', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(status.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Updated by {status.updatedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            
            <img
              src={issue.images[currentImageIndex]}
              alt={`Issue image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {issue.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueDetail;