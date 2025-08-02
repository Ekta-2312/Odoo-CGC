import React from 'react';
import { useParams } from 'react-router-dom';

const IssueDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Issue Details
          </h1>
          <p className="text-gray-600">
            Viewing details for issue ID: {id}
          </p>
          <div className="mt-8">
            <p className="text-gray-500">
              Issue detail view is coming soon. This page will show full details of the selected issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
