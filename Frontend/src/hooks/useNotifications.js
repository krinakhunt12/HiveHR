import { useState, useEffect, useCallback } from 'react';
import { mockNotifications } from '../data/mockNotifications';
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // WebSocket hook for real-time notifications removed
  // const { lastMessage, readyState } = useWebSocket('ws://localhost:3001/notifications');

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load initial notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Handle new real-time notifications removed

  // Request notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    // In real app, call API to mark as read
    // await api.markNotificationAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // In real app, call API to mark all as read
    // await api.markAllNotificationsAsRead();
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );

    // In real app, call API to delete notification
    // await api.deleteNotification(notificationId);
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    webSocketStatus: 3 // WebSocket.CLOSED
  };
};