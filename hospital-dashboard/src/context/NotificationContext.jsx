/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext(null);
const NOTIF_KEY = 'curepulse_notifications_v2';

const initialNotifications = [
  {
    id: 'sys-update',
    title: 'System Update',
    shortDescription: 'Patient portal has been updated.',
    details: 'We have updated the portal framework to version 4.2. This release improves dashboard rendering, stabilizes charts under heavy loads, and optimizes clinical record exports. All connections are fully encrypted.',
    time: '10m ago',
    read: false,
    type: 'info',
    scope: 'all',
  },
  {
    id: 'welcome',
    title: 'Welcome to CurePulse',
    shortDescription: 'Welcome to CurePulse Dashboard.',
    details: 'Your user profile has been provisioned successfully. You now have access to medical charts, appointment logs, live queue details, and reports based on your authorized role permissions.',
    time: '1h ago',
    read: false,
    type: 'success',
    scope: 'all',
  },
  {
    id: 'schedule-reminder',
    title: 'Upcoming Appointment Reminder',
    shortDescription: 'Cardiology consultation in 2 hours.',
    details: 'Friendly reminder that your cardiology follow-up with Dr. Sarah Chen is scheduled for today. Please check in at least 15 minutes prior to your time slot.',
    time: '2h ago',
    read: true,
    type: 'warning',
    scope: 'all',
  }
];

function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore parse errors */ }
  return initialNotifications;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadNotifications);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
    } catch { /* ignore storage errors */ }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAsUnread = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      time: 'Just now',
      read: false,
      shortDescription: notification.shortDescription || notification.message || '',
      details: notification.details || notification.message || '',
      type: notification.type || 'info',
      scope: notification.scope || 'all',
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    toast.success(notification.title);
    return newNotification;
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getNurseNotifications = useCallback(() => {
    return notifications.filter(n => n.scope === 'nurse' || n.scope === 'all');
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      clearAllNotifications,
      addNotification,
      deleteNotification,
      getNurseNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
