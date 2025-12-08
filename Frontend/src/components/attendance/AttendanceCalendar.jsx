import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

const AttendanceCalendar = ({ records }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  const days = [];
  const day = new Date(startDate);
  while (day <= monthEnd || day.getDay() !== 0) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const getRecordForDate = (date) => {
    return records.find(
      (r) => new Date(r.date).toDateString() === date.toDateString()
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => {
          const record = getRecordForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`aspect-square p-2 rounded-lg border transition-all ${
                isCurrentMonth
                  ? "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                  : "bg-slate-50 border-slate-100"
              } ${isToday ? "ring-2 ring-slate-800" : ""}`}
            >
              <div className="h-full flex flex-col">
                <div
                  className={`text-sm font-semibold mb-1 ${
                    isCurrentMonth ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {day.getDate()}
                </div>
                {record && isCurrentMonth && (
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        record.status === "present"
                          ? "bg-green-500"
                          : record.status === "late"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    {record.totalHours && (
                      <p className="text-xs text-slate-600 mt-1">{record.totalHours}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-slate-600">Absent</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
