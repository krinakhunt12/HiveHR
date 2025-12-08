import React from 'react';
import { formatRelativeTime, getNotificationIcon } from '../../utils/notificationUtils';

const NotificationItem = ({ notification, onClick }) => {
  const handleClick = () => {
    onClick(notification.id);
    // Handle navigation based on notification type
    handleNotificationAction(notification);
  };

  const handleNotificationAction = (notification) => {
    // Navigate to relevant page based on notification type
    const actionMap = {
      leave_approved: '/leaves',
      leave_rejected: '/leaves',
      leave_applied: '/leaves',
      review_assigned: '/performance',
      kpi_milestone: '/kpi',
      system_alert: '/dashboard',
      new_message: '/messages'
    };

    const route = actionMap[notification.type];
    if (route) {
      // In a real app, you would use your router here
      console.log('Navigating to:', route);
      // router.push(route);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Get the icon component
  const IconComponent = getNotificationIcon(notification.type);

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-l-4 cursor-pointer transition-all hover:bg-gray-100 ${
        notification.read ? 'bg-white' : getPriorityColor(notification.priority)
      } ${!notification.read ? 'border-l-gray-900' : ''}`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className={`p-1 rounded-full ${
            notification.read ? 'text-gray-400' : 'text-gray-700'
          }`}>
            <IconComponent className="w-4 h-4" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
              {notification.message}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-gray-900 rounded-full flex-shrink-0 mt-1.5"></div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(notification.createdAt)}
            </span>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Mark as read action would be handled by parent
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Mark as read"
                >
                  {/* You can add a check icon here if needed */}
                </button>
              )}
            </div>
          </div>

          {/* Additional Context */}
          {notification.metadata && (
            <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs text-gray-600">
              {Object.entries(notification.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;