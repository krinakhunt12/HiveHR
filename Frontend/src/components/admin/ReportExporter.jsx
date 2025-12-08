import React, { useState } from 'react';
import { Download, FileText, BarChart3, Users, Calendar, Filter } from 'lucide-react';

const ReportExporter = ({ data, loading }) => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState('monthly');
  const [format, setFormat] = useState('csv');

  const reportTypes = [
    {
      id: 'attendance',
      name: 'Attendance Report',
      description: 'Daily attendance records and patterns',
      icon: Users
    },
    {
      id: 'leave',
      name: 'Leave Analysis',
      description: 'Leave trends and utilization by department',
      icon: Calendar
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      description: 'Employee performance and productivity data',
      icon: BarChart3
    },
    {
      id: 'hr',
      name: 'HR Analytics',
      description: 'Comprehensive HR metrics and insights',
      icon: FileText
    }
  ];

  const dateRanges = [
    { value: 'weekly', label: 'Last 7 Days' },
    { value: 'monthly', label: 'Last 30 Days' },
    { value: 'quarterly', label: 'Last Quarter' },
    { value: 'yearly', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const formats = [
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'pdf', label: 'PDF' }
  ];

  const handleExport = () => {
    // In real app, this would trigger the export process
    console.log('Exporting:', { selectedReport, dateRange, format });
    // Show success message
    alert(`Exporting ${selectedReport} report as ${format.toUpperCase()} for ${dateRange} range`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600 mt-2 text-center">Loading report options...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Export Reports</h2>
        <p className="text-gray-600">Generate and download comprehensive system reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedReport === report.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-gray-700" />
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  {formats.map(fmt => (
                    <option key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExport}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Recent Exports</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Attendance Report</span>
                <span className="text-gray-900">2 days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Leave Analysis</span>
                <span className="text-gray-900">1 week ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HR Analytics</span>
                <span className="text-gray-900">2 weeks ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportExporter;