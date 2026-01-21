import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import LeaveForm from '../../components/leaves/LeaveForm';
import LeaveTable from '../../components/leaves/LeaveTable';
import LeaveBalanceCard from '../../components/leaves/LeaveBalanceCard';
import { useMyLeaves, useLeaveBalance, useCreateLeave } from '../../hooks/api/useLeaveQueries';
import { useToast } from '../../hooks/useToast';

const MyLeaves = () => {
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  // Fetch API Data
  const { data: leavesData, isLoading: leavesLoading } = useMyLeaves();
  const leaves = leavesData?.data?.leaves || [];

  const currentYear = new Date().getFullYear();
  const { data: balanceData, isLoading: balanceLoading } = useLeaveBalance(currentYear);
  const balances = balanceData?.data; // Structure depends on API, usually data.balance or just data if it's the row

  const createLeaveMutation = useCreateLeave();

  const handleSubmitLeave = async (leaveData) => {
    try {
      await createLeaveMutation.mutateAsync({
        start_date: leaveData.startDate,
        end_date: leaveData.endDate,
        type: leaveData.type,
        reason: leaveData.reason
      });
      setShowForm(false);
      showToast('Leave application submitted successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to submit leave application', 'error');
    }
  };

  // Map API data to UI format
  const mappedLeaves = leaves.map(leave => ({
    id: leave.id,
    startDate: leave.start_date,
    endDate: leave.end_date,
    type: leave.type,
    reason: leave.reason,
    status: leave.status,
    employeeName: leave.user?.full_name || 'Me', // Optional for MyLeaves
    // duration: calculate... (LeaveTable calculates it)
  }));

  const isLoading = leavesLoading || balanceLoading;

  return (
    <div className="space-y-6">
      {/* Header with Apply Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Leave Applications</h2>
          <p className="text-gray-600 text-sm">View and manage your leave requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isLoading}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balance */}
      <LeaveBalanceCard balances={balances} />

      {/* Leave Applications Table */}
      <div className="bg-white rounded-lg border border-gray-300">
        <LeaveTable
          leaves={mappedLeaves}
          loading={isLoading}
          showActions={false}
        />
      </div>

      {/* Leave Application Form Modal */}
      {showForm && (
        <LeaveForm
          onSubmit={handleSubmitLeave}
          onCancel={() => setShowForm(false)}
          balances={balances}
        />
      )}
    </div>
  );
};

export default MyLeaves;