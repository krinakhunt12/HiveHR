import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TrendIndicator = ({ value }) => {
  const getTrend = () => {
    if (value > 0) return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' };
    if (value < 0) return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' };
    return { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const { icon: Icon, color, bg } = getTrend();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{Math.abs(value)}%</span>
    </div>
  );
};

export default TrendIndicator;