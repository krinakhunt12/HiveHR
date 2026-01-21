import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import CheckInOutCard from "../../components/attendance/CheckInOutCard";
import TodayStatusCard from "../../components/attendance/TodayStatusCard";
import AttendanceStats from "../../components/attendance/AttendanceStats";
import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import AttendanceTimeline from "../../components/attendance/AttendanceTimeline";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import { useTodayAttendance, useMyAttendance, useCheckIn, useCheckOut } from "../../hooks/api/useAttendanceQueries";
import { Calendar, List } from "lucide-react";

/**
 * Attendance Page
 * Primary interface for tracking work hours and viewing history
 */
const AttendancePage = () => {
  const { data: todayResp, isLoading: todayLoading } = useTodayAttendance();
  const { data: historyResp, isLoading: historyLoading } = useMyAttendance();

  const todayAttendanceData = todayResp?.data;
  const attendanceHistory = historyResp?.data?.attendance || [];

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "table"

  const isLoading = todayLoading || historyLoading;

  // Mutation Handlers
  const handleCheckIn = async (location) => {
    try {
      await checkInMutation.mutateAsync({ check_in_location: location });
    } catch (err) {
      console.error("Check-in protocol failure", err);
    }
  };

  const handleCheckOut = async (location) => {
    try {
      await checkOutMutation.mutateAsync({ check_out_location: location });
    } catch (err) {
      console.error("Check-out protocol failure", err);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="w-10 h-10 border-4 border-foreground/10 border-t-foreground rounded-none animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Transform data for UI components
  const todayAttendance = todayAttendanceData ? {
    id: todayAttendanceData.id,
    checkInTime: todayAttendanceData.check_in_time ? new Date(todayAttendanceData.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    checkInLocation: todayAttendanceData.check_in_location,
    checkOutTime: todayAttendanceData.check_out_time ? new Date(todayAttendanceData.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    checkOutLocation: todayAttendanceData.check_out_location,
    totalHours: todayAttendanceData.total_hours ? `${todayAttendanceData.total_hours}h` : null,
    status: todayAttendanceData.status
  } : null;

  const stats = {
    totalDays: attendanceHistory.length,
    presentDays: attendanceHistory.filter(a => a.status === 'present' || a.status === 'full-day').length,
    absentDays: 0,
    avgHours: attendanceHistory.length > 0
      ? (attendanceHistory.reduce((acc, curr) => acc + (curr.total_hours || 0), 0) / attendanceHistory.length).toFixed(1)
      : 0
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 space-y-12 animate-fade-in max-w-7xl mx-auto text-foreground">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase underline decoration-4 underline-offset-8">Chronos_Log</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-6">Temporal monitoring and personnel presence tracking.</p>
          </div>

          <div className="flex items-center gap-2 bg-secondary/50 p-1 border border-foreground/5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-6 py-2.5 font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === "calendar"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Grid_View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-6 py-2.5 font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === "table"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <List className="w-3.5 h-3.5" />
              List_View
            </button>
          </div>
        </div>

        {/* Today's Status & Check In/Out */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckInOutCard
              attendance={todayAttendance}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          </div>
          <TodayStatusCard attendance={todayAttendance} />
        </div>

        {/* Statistics */}
        <AttendanceStats stats={stats} />

        {/* Timeline (Last 7 Days) */}
        <AttendanceTimeline records={attendanceHistory.slice(0, 7)} />

        {/* Calendar or Table View */}
        <div className="border border-foreground/5 bg-background shadow-2xl shadow-foreground/5">
          {viewMode === "calendar" ? (
            <AttendanceCalendar records={attendanceHistory} />
          ) : (
            <AttendanceTable records={attendanceHistory} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
