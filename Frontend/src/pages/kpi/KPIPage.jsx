import React, { useState } from 'react';
import { TrendingUp, BarChart3, Filter } from 'lucide-react';
import KpiCard from '../../components/kpi/KpiCard';
import KpiChart from '../../components/kpi/KpiChart';
import DepartmentChart from '../../components/kpi/DepartmentChart';
import FilterBar from '../../components/kpi/FilterBar';
import StatsOverview from '../../components/kpi/StatsOverview';
import { useKPI } from '../../hooks/useKPI';
import DashboardLayout from '../../components/layout/DashboardLayout';

const KPIPage = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [department, setDepartment] = useState('all');
  const { kpiData, loading, error } = useKPI(timeRange, department);

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-7xl mx-auto text-center py-12">
            <div className="text-red-600 text-lg">Failed to load KPI data</div>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">KPI Analytics Dashboard</h1>
            </div>
            <p className="text-gray-600">Monitor organizational productivity and trends</p>
          </div>

          {/* Filters */}
          <FilterBar
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            department={department}
            onDepartmentChange={setDepartment}
          />

          {/* Stats Overview */}
          <StatsOverview data={kpiData?.overview} loading={loading} />

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
              title="Attendance Rate"
              value={kpiData?.attendanceRate || 0}
              change={kpiData?.attendanceChange || 0}
              icon="users"
              loading={loading}
            />
            <KpiCard
              title="Avg Working Hours"
              value={kpiData?.avgWorkingHours || 0}
              change={kpiData?.hoursChange || 0}
              icon="clock"
              loading={loading}
            />
            <KpiCard
              title="Task Completion"
              value={kpiData?.taskCompletion || 0}
              change={kpiData?.taskChange || 0}
              icon="checkCircle"
              loading={loading}
            />
            <KpiCard
              title="Leave Rate"
              value={kpiData?.leaveRate || 0}
              change={kpiData?.leaveChange || 0}
              icon="calendar"
              loading={loading}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hours Worked Over Time */}
            <KpiChart
              title="Hours Worked Over Time"
              data={kpiData?.hoursTrend || []}
              type="line"
              loading={loading}
            />

            {/* Leaves by Department */}
            <DepartmentChart
              title="Leaves by Department"
              data={kpiData?.leavesByDepartment || []}
              loading={loading}
            />
          </div>

          {/* Performance Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KpiChart
              title="Performance Distribution"
              data={kpiData?.performanceDistribution || []}
              type="pie"
              loading={loading}
            />

            {/* Department Comparison */}
            <KpiChart
              title="Department KPI Comparison"
              data={kpiData?.departmentComparison || []}
              type="bar"
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KPIPage;