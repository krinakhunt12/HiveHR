import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import CheckInOutCard from "../../components/attendance/CheckInOutCard";
import TodayStatusCard from "../../components/attendance/TodayStatusCard";
import AttendanceStats from "../../components/attendance/AttendanceStats";
import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import AttendanceTimeline from "../../components/attendance/AttendanceTimeline";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import { useAttendance } from "../../hooks/useAttendance";
import { Calendar, List } from "lucide-react";

const AttendancePage = () => {
  const { todayAttendance, attendanceHistory, stats, checkIn, checkOut, isLoading } = useAttendance();
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "table"

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Attendance</h1>
            <p className="text-slate-600">Track your working hours and attendance records</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                viewMode === "calendar"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                viewMode === "table"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-4 h-4" />
              Table
            </button>
          </div>
        </div>

        {/* Today's Status & Check In/Out */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CheckInOutCard
              attendance={todayAttendance}
              onCheckIn={checkIn}
              onCheckOut={checkOut}
            />
          </div>
          <TodayStatusCard attendance={todayAttendance} />
        </div>

        {/* Statistics */}
        <AttendanceStats stats={stats} />

        {/* Timeline (Last 7 Days) */}
        <AttendanceTimeline records={attendanceHistory.slice(0, 7)} />

        {/* Calendar or Table View */}
        {viewMode === "calendar" ? (
          <AttendanceCalendar records={attendanceHistory} />
        ) : (
          <AttendanceTable records={attendanceHistory} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
