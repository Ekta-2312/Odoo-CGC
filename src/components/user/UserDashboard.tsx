import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600">
            This is your dashboard where you can track your reported issues and view community updates.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">Your Reports</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Resolved</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">0</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-900">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
