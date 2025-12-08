import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const AttendanceCard = ({ data }) => {
  const isCheckedIn = data.status === "checked-in";

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        {isCheckedIn ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">Today's Attendance</h3>
      <p className="text-2xl font-bold text-slate-900 mb-2">
        {isCheckedIn ? "Checked In" : "Not Checked In"}
      </p>
      <div className="space-y-1">
        {data.checkInTime && (
          <p className="text-sm text-slate-600">
            Check-in: <span className="font-semibold">{data.checkInTime}</span>
          </p>
        )}
        {data.checkOutTime && (
          <p className="text-sm text-slate-600">
            Check-out: <span className="font-semibold">{data.checkOutTime}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceCard;
