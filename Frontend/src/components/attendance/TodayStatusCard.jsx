import React from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

const TodayStatusCard = ({ attendance }) => {
  const getStatus = () => {
    if (!attendance?.checkInTime) return { label: "Not Checked In", type: "absent" };
    if (attendance.isLate) return { label: "Late", type: "late" };
    if (attendance.checkOutTime) return { label: "Present", type: "present" };
    return { label: "Checked In", type: "present" };
  };

  const status = getStatus();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg ${
          status.type === "present" ? "bg-green-100" :
          status.type === "late" ? "bg-yellow-100" :
          "bg-slate-100"
        }`}>
          <Clock className={`w-6 h-6 ${
            status.type === "present" ? "text-green-600" :
            status.type === "late" ? "text-yellow-600" :
            "text-slate-600"
          }`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Today's Status</h3>
          <StatusBadge status={status.type} label={status.label} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Expected Time</span>
          <span className="text-sm font-semibold text-slate-900">09:00 AM</span>
        </div>

        {attendance?.checkInTime && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Actual Check-in</span>
              <span className="text-sm font-semibold text-slate-900">
                {attendance.checkInTime}
              </span>
            </div>

            {attendance.isLate && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">
                  Late by {attendance.lateBy} minutes
                </span>
              </div>
            )}

            {!attendance.isLate && attendance.checkInTime && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  On time
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TodayStatusCard;
