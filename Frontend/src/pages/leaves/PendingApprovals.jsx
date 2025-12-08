import React from 'react';
import { Users, Clock } from 'lucide-react';
import LeaveTable from '../../components/leaves/LeaveTable';
import { useLeaves } from '../../hooks/useLeaves';
import { useToast } from '../../hooks/useToast';

const PendingApprovals = () => {
  const { leaves, loading, approveLeave, rejectLeave } = useLeaves();
  const { showToast } = useToast();

  const pendingLeaves = leaves.filter(leave => leave.status === 'pending');

  const handleApprove = async (leaveId) => {
    try {
      await approveLeave(leaveId);
      showToast('Leave approved successfully!', 'success');
    } catch (error) {
      showToast('Failed to approve leave', 'error');
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await rejectLeave(leaveId);
      showToast('Leave rejected successfully!', 'success');
    } catch (error) {
      showToast('Failed to reject leave', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Users className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
          <p className="text-gray-600 text-sm">Review and manage team leave requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-gray-700" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingLeaves.length}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Leaves Table */}
      <div className="bg-white rounded-lg border border-gray-300">
        <LeaveTable
          leaves={pendingLeaves}
          loading={loading}
          showActions={true}
          onApprove={handleApprove}
          onReject={handleReject}
          isManagerView={true}
        />
      </div>
    </div>
  );
};

export default PendingApprovals;