import React from "react";
import { Target, ArrowUp, ArrowDown } from "lucide-react";

const KpiCard = ({ data }) => {
  const isPositive = data.trend >= 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-orange-100 rounded-lg">
          <Target className="w-6 h-6 text-orange-600" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
          isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(data.trend)}%
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">This Week</h3>
      <p className="text-2xl font-bold text-slate-900 mb-2">{data.value} Hours</p>
      <p className="text-xs text-slate-600">Target: {data.target} hours/week</p>
    </div>
  );
};

export default KpiCard;
