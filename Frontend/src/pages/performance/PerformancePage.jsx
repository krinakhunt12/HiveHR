import React, { useState } from 'react';
import { Star, Users, Plus } from 'lucide-react';
import MyReviews from './MyReviews';
import TeamReviews from './TeamReviews';
import AddReview from './AddReview';
import PerformanceStats from '../../components/performance/PerformanceStats';
import { useToast } from '../../hooks/useToast';
import { useCurrentUser } from '../../hooks/api/useAuthQueries';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PerformancePage = () => {
  const [activeTab, setActiveTab] = useState('my-reviews');
  const { showToast } = useToast();
  const { data: userData } = useCurrentUser();
  const profile = userData?.data?.profile;
  const userRole = profile?.role || 'employee';

  const tabs = [
    { id: 'my-reviews', label: 'My Reviews', icon: Star },
    ...(userRole === 'manager' || userRole === 'hr' || userRole === 'admin'
      ? [
        { id: 'team-reviews', label: 'Team Reviews', icon: Users },
        { id: 'add-review', label: 'Add Review', icon: Plus }
      ]
      : []),
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Performance & Reviews</h1>
            <p className="text-gray-600 mt-2">Track and manage employee performance evaluations</p>
          </div>

          {/* Performance Stats */}
          <PerformanceStats />

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
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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
              {activeTab === 'my-reviews' && <MyReviews />}
              {activeTab === 'team-reviews' && <TeamReviews />}
              {activeTab === 'add-review' && <AddReview />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerformancePage;