import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: 'bg-green-100 text-green-800',
          dot: 'bg-green-500'
        };
      case 'remote':
        return {
          label: 'Remote',
          color: 'bg-blue-100 text-blue-800',
          dot: 'bg-blue-500'
        };
      case 'inactive':
        return {
          label: 'Inactive',
          color: 'bg-gray-100 text-gray-800',
          dot: 'bg-gray-400'
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          dot: 'bg-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

export default StatusBadge;