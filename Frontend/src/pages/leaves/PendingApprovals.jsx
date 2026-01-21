import React from 'react';
import { Users, Clock } from 'lucide-react';
import LeaveTable from '../../components/leaves/LeaveTable';
import { useAllLeaves, useApproveLeave, useRejectLeave } from '../../hooks/api/useLeaveQueries';
import { useToast } from '../../hooks/useToast';

const PendingApprovals = () => {
  const { data: leavesData, isLoading } = useAllLeaves({ status: 'pending' });
  const leaves = leavesData?.data?.leaves || [];

  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  const { showToast } = useToast();

  const handleApprove = async (leaveId) => {
    try {
      await approveMutation.mutateAsync(leaveId);
      showToast('Leave approved successfully!', 'success');
    } catch (error) {
      showToast('Failed to approve leave', 'error');
    }
  };

  const handleReject = async (leaveId) => {
    try {
      // Reason is required by backend but for quick action we might default or ask.
      // LeaveTable currently just calls onReject(id).
      // We'll pass a default reason for now or simpler, update logic to prompt.
      // For this implementation, we'll default it. 
      await rejectMutation.mutateAsync({ id: leaveId, reason: 'Manager Rejected' });
      showToast('Leave rejected successfully!', 'success');
    } catch (error) {
      showToast('Failed to reject leave', 'error');
    }
  };

  const mappedLeaves = leaves.map(leave => ({
    id: leave.id,
    startDate: leave.start_date,
    endDate: leave.end_date,
    type: leave.type,
    reason: leave.reason,
    status: leave.status,
    employeeName: leave.user?.full_name || 'Unknown',
    employeeEmail: leave.user?.email || 'N/A' // user object might not have email depending on query
  }));

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
              <p className="text-2xl font-bold text-gray-900">{mappedLeaves.length}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Leaves Table */}
      <div className="bg-white rounded-lg border border-gray-300">
        <LeaveTable
          leaves={mappedLeaves}
          loading={isLoading}
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