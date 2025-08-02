import React, { useState } from 'react';
import { MapPin, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { issuesApi } from '../../services/api';

const ReportIssueForm: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Roads',
    location: {
      address: '',
      latitude: 40.7128,
      longitude: -74.0060
    },
    isAnonymous: false,
    priority: 'medium'
  });

  const categories = [
    'Roads',
    'Lighting', 
    'Vandalism',
    'Waste',
    'Parks',
    'Traffic',
    'Utilities',
    'Safety',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to report an issue');
      return;
    }

    setIsSubmitting(true);

    try {
      const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location: {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          address: formData.location.address
        },
        images: [],
        tags: [],
        isPublic: !formData.isAnonymous,
        reportedBy: user.id
      };

      console.log('Submitting issue:', issueData);

      const response = await issuesApi.createIssue(issueData);
      
      if (response.success) {
        setSubmitted(true);
        // Reset form after successful submission
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            title: '',
            description: '',
            category: 'Roads',
            location: {
              address: '',
              latitude: 40.7128,
              longitude: -74.0060
            },
            isAnonymous: false,
            priority: 'medium'
          });
        }, 3000);
      } else {
        alert(`Error: ${response.message || 'Failed to create issue'}`);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Report Submitted Successfully!</h2>
          <p className="text-green-700">
            Your issue has been reported and assigned ID #RT{Date.now()}. 
            You can track its progress in your dashboard and view it on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
            <p className="mt-2 text-gray-600">
              Help improve your community by reporting civic issues
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Brief description of the issue"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Provide detailed information about the issue"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, address: e.target.value }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter the address or location of the issue"
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide the specific address or landmark where the issue is located
              </p>
            </div>

            {/* Coordinates (simplified for demo) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.latitude}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, latitude: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.longitude}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, longitude: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                Report anonymously
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your report will be reviewed by local administrators</li>
                  <li>You'll receive updates on the progress of your issue</li>
                  <li>False or spam reports may result in account suspension</li>
                  <li>For emergencies, please contact local emergency services</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssueForm;
