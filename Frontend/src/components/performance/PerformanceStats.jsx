import React from 'react';
import { Star, Target, TrendingUp, Users } from 'lucide-react';
import { usePerformance } from '../../hooks/usePerformance';

const PerformanceStats = () => {
  const { reviews, goals } = usePerformance();
  const userRole = localStorage.getItem('userRole') || 'employee';

  const stats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length).toFixed(1)
      : 0,
    goalsProgress: goals.length > 0
      ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
      : 0,
    teamMembers: userRole === 'manager' || userRole === 'admin' ? 12 : 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Total Reviews */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Star className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
        </div>
      </div>

      {/* Average Rating */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Target className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.goalsProgress)}%</p>
            <p className="text-sm text-gray-600">Goals Progress</p>
          </div>
        </div>
      </div>

      {/* Team Members (Manager only) */}
      {(userRole === 'manager' || userRole === 'admin') && (
        <div className="bg-white p-6 rounded-lg border border-gray-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
              <p className="text-sm text-gray-600">Team Members</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceStats;