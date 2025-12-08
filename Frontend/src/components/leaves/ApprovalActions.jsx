import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ApprovalActions = ({ onApprove, onReject }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onApprove}
        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
      >
        <CheckCircle className="w-4 h-4" />
        Approve
      </button>
      <button
        onClick={onReject}
        className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
      >
        <XCircle className="w-4 h-4" />
        Reject
      </button>
    </div>
  );
};

export default ApprovalActions;