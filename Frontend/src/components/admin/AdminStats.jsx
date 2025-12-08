import React from 'react';
import { Users, Building, Shield, TrendingUp, Clock, FileText } from 'lucide-react';

const AdminStats = ({ data, loading = false }) => {
  const stats = [
    {
      label: 'Total Employees',
      value: data?.totalEmployees || 0,
      change: data?.employeeChange || 0,
      icon: Users,
      color: 'gray'
    },
    {
      label: 'Departments',
      value: data?.totalDepartments || 0,
      change: data?.departmentChange || 0,
      icon: Building,
      color: 'gray'
    },
    {
      label: 'Active Roles',
      value: data?.activeRoles || 0,
      change: data?.roleChange || 0,
      icon: Shield,
      color: 'gray'
    },
    {
      label: 'Avg Attendance',
      value: data?.avgAttendance || 0,
      change: data?.attendanceChange || 0,
      icon: TrendingUp,
      color: 'gray'
    },
    {
      label: 'Pending Leaves',
      value: data?.pendingLeaves || 0,
      change: data?.leaveChange || 0,
      icon: Clock,
      color: 'gray'
    },
    {
      label: 'This Month',
      value: data?.monthlyReports || 0,
      change: data?.reportChange || 0,
      icon: FileText,
      color: 'gray'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-300 p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-200 rounded-lg w-12 h-12"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-300 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Icon className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
                {stat.change !== 0 && (
                  <p className={`text-xs ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}% from last month
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;