import React from "react";
import { TrendingUp, Star } from "lucide-react";

const PerformanceCard = ({ data }) => {
  const getScoreColor = (score) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className={`text-sm font-bold ${getScoreColor(data.score)}`}>
            {data.score}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">Performance Score</h3>
      <p className="text-2xl font-bold text-slate-900 mb-2">{data.rating}</p>
      <p className="text-xs text-slate-600">
        Last reviewed: {data.lastReviewDate}
      </p>
    </div>
  );
};

export default PerformanceCard;
