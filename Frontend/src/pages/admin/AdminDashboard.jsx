import React, { useState } from 'react';
import { Settings, Users, BarChart3, Shield, Download, Plus } from 'lucide-react';
import AdminStats from '../../components/admin/AdminStats';
import SystemHealthCard from '../../components/admin/SystemHealthCard';
import UserManagementTable from '../../components/admin/UserManagementTable';
import LeavePolicyManager from '../../components/admin/LeavePolicyManager';
import DepartmentKPISummary from '../../components/admin/DepartmentKPISummary';
import ReportExporter from '../../components/admin/ReportExporter';
import QuickActions from '../../components/admin/QuickActions';
import { useAdmin } from '../../hooks/useAdmin';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const { adminData, loading, error, refreshData } = useAdmin();
  const { showToast } = useToast();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'policies', label: 'Leave Policies', icon: Shield },
    { id: 'reports', label: 'Reports', icon: Download },
  ];

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-7xl mx-auto text-center py-12">
            <div className="text-red-600 text-lg">Failed to load admin dashboard</div>
            <p className="text-gray-600 mt-2">{error}</p>
            <button
              onClick={refreshData}
              className="mt-4 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-gray-700" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-gray-600">Manage system settings and view analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshData}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Admin Stats */}
          <AdminStats data={adminData?.stats} loading={loading} />

          {/* System Health */}
          <SystemHealthCard data={adminData?.systemHealth} loading={loading} />

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-300 mb-6">
            <div className="border-b border-gray-300">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-gray-900 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <DepartmentKPISummary 
                    data={adminData?.departmentKPIs} 
                    loading={loading} 
                  />
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                      <p className="text-gray-600 text-sm">Manage employee accounts and permissions</p>
                    </div>
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>
                  <UserManagementTable 
                    users={adminData?.users || []}
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === 'policies' && (
                <LeavePolicyManager 
                  policies={adminData?.leavePolicies}
                  loading={loading}
                />
              )}

              {activeTab === 'reports' && (
                <ReportExporter 
                  data={adminData}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;