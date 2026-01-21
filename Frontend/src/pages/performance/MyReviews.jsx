import React from 'react';
import { Filter, Download } from 'lucide-react';
import PerformanceTable from '../../components/performance/PerformanceTable';
import GoalTracker from '../../components/performance/GoalTracker';
import { useMyReviews } from '../../hooks/api/usePerformanceQueries';

const MyReviews = () => {
  const { data: reviews, isLoading } = useMyReviews();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Performance Reviews</h2>
          <p className="text-gray-600 text-sm">View your performance history and feedback</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Goal Tracker - Hidden or updated if goals API exists */}
      {/* <GoalTracker goals={goals} /> */}

      {/* Reviews Table */}
      <div className="bg-white rounded-lg border border-gray-300">
        <PerformanceTable
          reviews={reviews || []}
          loading={isLoading}
          showActions={false}
        />
      </div>
    </div>
  );
};

export default MyReviews;