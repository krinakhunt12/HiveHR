import React from 'react';

const NotificationBadge = ({ count }) => {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full px-1">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;