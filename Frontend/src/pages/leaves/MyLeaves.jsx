import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import LeaveForm from '../../components/leaves/LeaveForm';
import LeaveTable from '../../components/leaves/LeaveTable';
import LeaveBalanceCard from '../../components/leaves/LeaveBalanceCard';
import { useLeaves } from '../../hooks/useLeaves';
import { useToast } from '../../hooks/useToast';

const MyLeaves = () => {
  const [showForm, setShowForm] = useState(false);
  const { leaves, loading, applyForLeave } = useLeaves();
  const { showToast } = useToast();

  const handleSubmitLeave = async (leaveData) => {
    try {
      await applyForLeave(leaveData);
      setShowForm(false);
      showToast('Leave application submitted successfully!', 'success');
    } catch (error) {
      showToast('Failed to submit leave application', 'error');
    }
  };

  const myLeaves = leaves.filter(leave => leave.employeeId === 'current-user');

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
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balance */}
      <LeaveBalanceCard />

      {/* Leave Applications Table */}
      <div className="bg-white rounded-lg border border-gray-300">
        <LeaveTable 
          leaves={myLeaves} 
          loading={loading}
          showActions={true}
        />
      </div>

      {/* Leave Application Form Modal */}
      {showForm && (
        <LeaveForm
          onSubmit={handleSubmitLeave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default MyLeaves;