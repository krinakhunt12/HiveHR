import React, { useState } from 'react';
import { Calendar, Clock, FileCheck, History } from 'lucide-react';
import MyLeaves from './MyLeaves';
import PendingApprovals from './PendingApprovals';
import LeaveHistory from './LeaveHistory';
import LeaveStats from '../../components/leaves/LeaveStats';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const LeavesPage = () => {
  const [activeTab, setActiveTab] = useState('my-leaves');
  const { showToast } = useToast();
  const userRole = localStorage.getItem('userRole') || 'employee';

  const tabs = [
    { id: 'my-leaves', label: 'My Leaves', icon: Calendar },
    ...(userRole === 'manager' || userRole === 'admin' 
      ? [{ id: 'approvals', label: 'Pending Approvals', icon: FileCheck }]
      : []),
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-2">Manage your time off and approvals</p>
          </div>

          {/* Leave Stats */}
          <LeaveStats />

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
              {activeTab === 'my-leaves' && <MyLeaves />}
              {activeTab === 'approvals' && <PendingApprovals />}
              {activeTab === 'history' && <LeaveHistory />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeavesPage;