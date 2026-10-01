import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const knownNotificationIds = useRef(new Set());
  const initialFetchDone = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      knownNotificationIds.current.clear();
      initialFetchDone.current = false;
      return;
    }
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res && res.notifications) {
        const notifs = res.notifications || [];
        setNotifications(notifs);
        setUnreadCount(res.unreadCount || 0);

        // If this is not the initial load, check for newly arrived notifications
        if (initialFetchDone.current) {
          notifs.forEach((n) => {
            if (!knownNotificationIds.current.has(n._id) && !n.read) {
              if (n.type === 'new_message') {
                showToast(`💬 ${n.title}: ${n.message}`, 'info', 5000);
              } else {
                showToast(`🔔 ${n.title}`, 'info', 4000);
              }
            }
          });
        }

        // Record all current IDs
        notifs.forEach((n) => knownNotificationIds.current.add(n._id));
        initialFetchDone.current = true;
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    fetchNotifications();

    // Fast polling (5 seconds) so new messages and booking updates notify promptly
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchNotifications();
      }
    }, 5000);

    const onFocus = () => {
      if (isAuthenticated) {
        fetchNotifications();
      }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchNotifications, isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
