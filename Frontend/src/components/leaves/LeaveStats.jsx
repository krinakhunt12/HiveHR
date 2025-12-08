import React from 'react';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLeaves } from '../../hooks/useLeaves';

const LeaveStats = () => {
  const { leaves } = useLeaves();
  const userRole = localStorage.getItem('userRole') || 'employee';

  const stats = {
    total: leaves.length,
    approved: leaves.filter(leave => leave.status === 'approved').length,
    pending: leaves.filter(leave => leave.status === 'pending').length,
    rejected: leaves.filter(leave => leave.status === 'rejected').length,
  };

  const managerStats = userRole === 'manager' || userRole === 'admin' 
    ? { pendingApprovals: leaves.filter(leave => leave.status === 'pending').length }
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Total Leaves */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Calendar className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Leaves</p>
          </div>
        </div>
      </div>

      {/* Approved */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Clock className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Rejected */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <XCircle className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
      </div>

      {/* Manager Pending Approvals */}
      {managerStats && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 md:col-span-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-200 rounded-lg">
                <Clock className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{managerStats.pendingApprovals}</p>
                <p className="text-sm text-gray-600">Pending Leave Requests Requiring Your Approval</p>
              </div>
            </div>
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Review Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveStats;