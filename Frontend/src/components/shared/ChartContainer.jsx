import React from 'react';
import { BarChart3 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ChartContainer = ({ title, children, loading = false }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ChartContainer;