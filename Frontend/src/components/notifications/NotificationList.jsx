import React from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { formatRelativeTime } from '../../utils/notificationUtils';

const NotificationList = ({ notifications, onNotificationClick, loading }) => {
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No notifications</p>
        <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
      </div>
    );
  }

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  return (
    <div className="p-2">
      {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
        <div key={date} className="mb-4">
          {/* Date Header */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {date === new Date().toDateString() ? 'Today' : 
                 date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : 
                 new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Notifications for this date */}
          <div className="space-y-1">
            {dayNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick(notification.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;