import React from "react";
import { Calendar } from "lucide-react";

const LeaveCard = ({ data }) => {
  const usagePercentage = (data.used / data.total) * 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">Leave Balance</h3>
      <p className="text-2xl font-bold text-slate-900 mb-3">
        {data.remaining} / {data.total} Days
      </p>
      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${usagePercentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-600">
        {data.used} days used • {data.pending} pending approval
      </p>
    </div>
  );
};

export default LeaveCard;
