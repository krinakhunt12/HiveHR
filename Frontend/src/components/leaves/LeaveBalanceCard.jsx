import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const LeaveBalanceCard = ({ balances }) => {
  if (!balances) return null;

  const leaveBalances = [
    {
      type: 'Casual Leave',
      total: balances.casual_leave_total || 0,
      used: balances.casual_leave_used || 0,
      remaining: (balances.casual_leave_total || 0) - (balances.casual_leave_used || 0)
    },
    {
      type: 'Sick Leave',
      total: balances.sick_leave_total || 0,
      used: balances.sick_leave_used || 0,
      remaining: (balances.sick_leave_total || 0) - (balances.sick_leave_used || 0)
    },
    {
      type: 'Earned Leave',
      total: balances.earned_leave_total || 0,
      used: balances.earned_leave_used || 0,
      remaining: (balances.earned_leave_total || 0) - (balances.earned_leave_used || 0)
    },
    {
      type: 'Maternity Leave',
      total: balances.maternity_leave_total || 0,
      used: balances.maternity_leave_used || 0,
      remaining: (balances.maternity_leave_total || 0) - (balances.maternity_leave_used || 0)
    },
    {
      type: 'Paternity Leave',
      total: balances.paternity_leave_total || 0,
      used: balances.paternity_leave_used || 0,
      remaining: (balances.paternity_leave_total || 0) - (balances.paternity_leave_used || 0)
    },
  ];

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalances.map((balance, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-900">{balance.type}</span>
              {balance.remaining < balance.total * 0.2 && (
                <AlertTriangle className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">{balance.remaining}</span>
              <span className="text-sm text-gray-500">/ {balance.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${balance.total > 0 ? (balance.used / balance.total) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Used: {balance.used}</span>
              <span>Remaining: {balance.remaining}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalanceCard;