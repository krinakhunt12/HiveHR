import React from "react";
import { Calendar } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

const AttendanceTimeline = ({ records }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Calendar className="w-5 h-5 text-slate-700" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Recent Activity (Last 7 Days)</h3>
      </div>

      <div className="space-y-3">
        {records.map((record, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex-shrink-0 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {new Date(record.date).getDate()}
              </div>
              <div className="text-xs text-slate-600">
                {new Date(record.date).toLocaleDateString("en-US", { month: "short" })}
              </div>
            </div>

            <div className="flex-shrink-0 w-px h-12 bg-slate-300"></div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-semibold text-slate-900">
                  {new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <StatusBadge status={record.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                {record.checkInTime && (
                  <span>In: <span className="font-semibold">{record.checkInTime}</span></span>
                )}
                {record.checkOutTime && (
                  <span>Out: <span className="font-semibold">{record.checkOutTime}</span></span>
                )}
                {record.totalHours && (
                  <span className="font-semibold text-slate-900">{record.totalHours}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceTimeline;