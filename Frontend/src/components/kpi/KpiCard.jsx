import React from 'react';
import { Users, Clock, CheckCircle, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import TrendIndicator from './TrendIndicator';

const KpiCard = ({ title, value, change, icon, loading = false }) => {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="w-5 h-5" />;
      case 'clock':
        return <Clock className="w-5 h-5" />;
      case 'checkCircle':
        return <CheckCircle className="w-5 h-5" />;
      case 'calendar':
        return <Calendar className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const formatValue = (val) => {
    if (title.includes('Rate') || title.includes('Completion')) {
      return `${val}%`;
    }
    if (title.includes('Hours')) {
      return `${val}h`;
    }
    return val;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-gray-400">
          {getIcon()}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-3xl font-bold text-gray-900">
          {formatValue(value)}
        </p>
        <TrendIndicator value={change} />
      </div>

      <p className="text-sm text-gray-500">
        {change >= 0 ? 'Increased' : 'Decreased'} by {Math.abs(change)}% from last period
      </p>
    </div>
  );
};

export default KpiCard;