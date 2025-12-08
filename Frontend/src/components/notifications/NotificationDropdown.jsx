import React from 'react';
import { X, Bell, CheckCircle, Settings } from 'lucide-react';
import NotificationList from './NotificationList';

const NotificationDropdown = ({
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllAsRead,
  onClose,
  loading
}) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-300 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Mark all as read"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        <NotificationList
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          loading={loading}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-300 bg-gray-50">
        <div className="flex justify-between items-center">
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Notification Settings
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;