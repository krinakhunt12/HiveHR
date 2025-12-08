import React from 'react';

const ProgressBar = ({ progress, color = 'gray' }) => {
  const getColorClass = () => {
    switch (color) {
      case 'green':
        return 'bg-green-600';
      case 'blue':
        return 'bg-blue-600';
      case 'red':
        return 'bg-red-600';
      default:
        return 'bg-gray-900';
    }
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${getColorClass()}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;