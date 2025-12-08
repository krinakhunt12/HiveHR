import React from "react";
import { CalendarDays } from "lucide-react";

const UpcomingHolidaysCard = ({ holidays }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <CalendarDays className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Upcoming Holidays</h3>
      </div>
      <div className="space-y-3">
        {holidays.map((holiday, index) => (
          <div 
            key={index}
            className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div>
              <p className="font-semibold text-slate-900 text-sm">{holiday.name}</p>
              <p className="text-xs text-slate-600 mt-1">{holiday.date}</p>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              {holiday.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingHolidaysCard;