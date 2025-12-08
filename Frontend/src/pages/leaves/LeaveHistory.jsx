import React from 'react';
import { Filter } from 'lucide-react';
import LeaveTable from '../../components/leaves/LeaveTable';
import { useLeaves } from '../../hooks/useLeaves';

const LeaveHistory = () => {
  const { leaves, loading } = useLeaves();
  
  // Filter leaves that are not pending
  const historyLeaves = leaves.filter(leave => leave.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leave History</h2>
          <p className="text-gray-600 text-sm">Track all your past leave applications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg border border-gray-300">
        <LeaveTable 
          leaves={historyLeaves}
          loading={loading}
          showActions={false}
        />
      </div>
    </div>
  );
};

export default LeaveHistory;