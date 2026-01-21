import React from 'react';
import { Users, Filter, Download } from 'lucide-react';
import PerformanceTable from '../../components/performance/PerformanceTable';
import { useTeamReviews } from '../../hooks/api/usePerformanceQueries';

const TeamReviews = () => {
  const { data: reviews, isLoading } = useTeamReviews();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Users className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Performance Reviews</h2>
          <p className="text-gray-600 text-sm">Monitor and manage your team's performance</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {reviews?.length || 0} performance reviews
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      {/* Team Reviews Table */}
      <div className="bg-white rounded-lg border border-gray-300">
        <PerformanceTable
          reviews={reviews || []}
          loading={isLoading}
          showActions={true}
          isManagerView={true}
        />
      </div>
    </div>
  );
};

export default TeamReviews;