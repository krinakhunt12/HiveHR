import React from "react";
import { TrendingUp, Calendar, Clock, AlertCircle } from "lucide-react";

const AttendanceStats = ({ stats }) => {
  const statCards = [
    {
      icon: <Calendar className="w-6 h-6" />,
      label: "Present Days",
      value: stats.presentDays,
      total: stats.totalDays,
      color: "green",
      percentage: ((stats.presentDays / stats.totalDays) * 100).toFixed(1),
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      label: "Late Days",
      value: stats.lateDays,
      total: stats.totalDays,
      color: "yellow",
      percentage: ((stats.lateDays / stats.totalDays) * 100).toFixed(1),
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "Avg. Hours/Day",
      value: stats.avgHours,
      suffix: "hrs",
      color: "blue",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Attendance Rate",
      value: stats.attendanceRate,
      suffix: "%",
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
              <div className={`text-${stat.color}-600`}>{stat.icon}</div>
            </div>
            {stat.percentage && (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                {stat.percentage}%
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.label}</h3>
          <p className="text-2xl font-bold text-slate-900">
            {stat.value}
            {stat.suffix && <span className="text-lg text-slate-600 ml-1">{stat.suffix}</span>}
            {stat.total && <span className="text-lg text-slate-600">/{stat.total}</span>}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AttendanceStats;

