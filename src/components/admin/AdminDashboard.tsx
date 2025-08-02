import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Welcome to the admin panel, {user?.name}. Here you can manage issues and moderate content.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">Total Issues</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-900">Pending Approval</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Resolved</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">0</p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-red-900">Flagged</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">0</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <p className="text-gray-600">• Review and approve new reports</p>
              <p className="text-gray-600">• Manage flagged content</p>
              <p className="text-gray-600">• View system analytics</p>
              <p className="text-gray-600">• Moderate user accounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
