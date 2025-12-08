import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Star, 
  TrendingUp, 
  AlertTriangle,
  Mail,
  User,
  FileText
} from 'lucide-react';
import React from 'react';

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

// Return the icon component instead of JSX
export const getNotificationIcon = (type) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case 'leave_approved':
      return CheckCircle;
    case 'leave_rejected':
      return XCircle;
    case 'leave_applied':
      return Calendar;
    case 'review_assigned':
      return Star;
    case 'kpi_milestone':
      return TrendingUp;
    case 'system_alert':
      return AlertTriangle;
    case 'new_message':
      return Mail;
    case 'user_mention':
      return User;
    case 'document_uploaded':
      return FileText;
    default:
      return CheckCircle;
  }
};

export const getNotificationColor = (type) => {
  switch (type) {
    case 'leave_approved':
    case 'kpi_milestone':
      return 'text-green-600';
    case 'leave_rejected':
    case 'system_alert':
      return 'text-red-600';
    case 'review_assigned':
      return 'text-yellow-600';
    case 'new_message':
    case 'user_mention':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export const shouldShowBrowserNotification = (notification) => {
  // Only show browser notifications for high priority or unread important notifications
  const importantTypes = ['system_alert', 'leave_approved', 'leave_rejected'];
  return importantTypes.includes(notification.type) && !notification.read;
};

// Helper to get icon component with props
export const renderNotificationIcon = (type, className = "w-4 h-4") => {
  const IconComponent = getNotificationIcon(type);
  return React.createElement(IconComponent, { className });
};