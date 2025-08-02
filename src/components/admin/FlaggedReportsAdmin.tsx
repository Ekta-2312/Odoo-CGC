import React from 'react';

const FlaggedReportsAdmin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Flagged Reports
          </h1>
          <p className="text-gray-600">
            Review and moderate flagged content and reports.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlaggedReportsAdmin;
