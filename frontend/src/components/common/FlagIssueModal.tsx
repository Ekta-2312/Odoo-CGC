import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { issuesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface FlagIssueModalProps {
  issueId: string;
  issueTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FlagIssueModal: React.FC<FlagIssueModalProps> = ({
  issueId,
  issueTitle,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug log when modal props change
  React.useEffect(() => {
    if (isOpen) {
      console.log('Flag Modal opened with:', { issueId, issueTitle, isOpen });
    }
  }, [isOpen, issueId, issueTitle]);

  const predefinedReasons = [
    'Spam or irrelevant content',
    'Inappropriate language or content', 
    'Duplicate report',
    'False or misleading information',
    'Not a civic issue',
    'Other'
  ];

  const handleSubmit = async () => {
    console.log('Flag modal - Issue ID:', issueId); // Debug log
    console.log('Flag modal - User ID:', user?.id); // Debug log
    
    if (!selectedReason && !reason.trim()) {
      alert('Please select a reason or provide details');
      return;
    }

    try {
      setLoading(true);
      const flagReason = selectedReason === 'Other' || !selectedReason ? reason : selectedReason;
      
      const response = await issuesApi.flagIssue(issueId, flagReason, user?.id || '');
      
      if (response.success) {
        alert('Issue flagged successfully');
        onSuccess();
        onClose();
      } else {
        alert('Failed to flag issue');
      }
    } catch (error) {
      console.error('Error flagging issue:', error);
      alert('Error flagging issue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center">
            <Flag className="w-5 h-5 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Flag Issue</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            You are flagging: <strong>{issueTitle}</strong>
          </p>

          <div className="space-y-3 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Reason for flagging:
            </label>
            {predefinedReasons.map((predefReason) => (
              <label key={predefReason} className="flex items-center">
                <input
                  type="radio"
                  name="flagReason"
                  value={predefReason}
                  checked={selectedReason === predefReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{predefReason}</span>
              </label>
            ))}
          </div>

          {(selectedReason === 'Other' || !selectedReason) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Please provide additional details..."
              />
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (!selectedReason && !reason.trim())}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Flagging...' : 'Flag Issue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlagIssueModal;
