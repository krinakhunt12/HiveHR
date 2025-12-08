import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardHeader from "../../components/shared/DashboardHeader";
import PersonalInfoCard from "../../components/dashboard/employee/PersonalInfoCard";
import AttendanceCard from "../../components/dashboard/employee/AttendanceCard";
import LeaveCard from "../../components/dashboard/employee/LeaveCard";
import PerformanceCard from "../../components/dashboard/employee/PerformanceCard";
import UpcomingHolidaysCard from "../../components/dashboard/employee/UpcomingHolidaysCard";
import FileListCard from "../../components/dashboard/employee/FileListCard";
import KpiCard from "../../components/dashboard/employee/KpiCard";
import KpiChart from "../../components/dashboard/employee/KpiChart";
import NotificationBell from "../../components/notifications/NotificationBell";
import { useEmployeeData } from "../../hooks/useEmployeeData";
import { RefreshCw } from "lucide-react";

const EmployeeDashboard = () => {
  const { 
    employeeData, 
    isLoading, 
    error, 
    refetch, 
    toggleAttendance,
    markNotificationAsRead 
  } = useEmployeeData();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="text-red-600 text-lg mb-4">Failed to load dashboard</div>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!employeeData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="text-slate-600 text-lg mb-4">No data available</div>
          <p className="text-slate-500">Please check back later</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
        <DashboardHeader 
          title="Employee Dashboard" 
          subtitle={`Welcome back, ${employeeData.personalInfo?.name || 'there'}! Here's your overview for today.`}
          actions={
            <div className="flex items-center gap-3">
              <NotificationBell 
                notifications={employeeData.notifications}
                onMarkAsRead={markNotificationAsRead}
              />
              <button
                onClick={refetch}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          }
        />

        {/* Personal Info Section */}
        {employeeData.personalInfo && (
          <PersonalInfoCard data={employeeData.personalInfo} />
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {employeeData.attendance && (
            <AttendanceCard 
              data={employeeData.attendance} 
              onToggleAttendance={toggleAttendance}
            />
          )}
          {employeeData.leave && (
            <LeaveCard data={employeeData.leave} />
          )}
          {employeeData.performance && (
            <PerformanceCard data={employeeData.performance} />
          )}
          {employeeData.kpi && (
            <KpiCard data={employeeData.kpi} />
          )}
        </div>

        {/* Charts and Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {employeeData.kpiHistory && (
              <KpiChart data={employeeData.kpiHistory} />
            )}
          </div>
          <div className="space-y-6">
            {employeeData.holidays && (
              <UpcomingHolidaysCard holidays={employeeData.holidays} />
            )}
            {employeeData.files && (
              <FileListCard files={employeeData.files} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;