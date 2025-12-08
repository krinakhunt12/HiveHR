import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsOverview = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-300 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Overall Productivity',
      value: `${data.overallProductivity}%`,
      change: data.productivityChange,
      trend: data.productivityChange > 0 ? 'up' : data.productivityChange < 0 ? 'down' : 'neutral'
    },
    {
      label: 'Team Engagement',
      value: `${data.teamEngagement}%`,
      change: data.engagementChange,
      trend: data.engagementChange > 0 ? 'up' : data.engagementChange < 0 ? 'down' : 'neutral'
    },
    {
      label: 'Goal Achievement',
      value: `${data.goalAchievement}%`,
      change: data.goalChange,
      trend: data.goalChange > 0 ? 'up' : data.goalChange < 0 ? 'down' : 'neutral'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-300 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
            {getTrendIcon(stat.trend)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;