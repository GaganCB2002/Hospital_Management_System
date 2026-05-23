/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const NotificationContext = createContext(null);

const initialNotifications = [
  {
    id: 'sys-update',
    title: 'System Update',
    shortDescription: 'Patient portal has been updated.',
    details: 'We have updated the portal framework to version 4.2. This release improves dashboard rendering, stabilizes charts under heavy loads, and optimizes clinical record exports. All connections are fully encrypted.',
    time: '10m ago',
    read: false,
    type: 'info'
  },
  {
    id: 'welcome',
    title: 'Welcome to CurePulse',
    shortDescription: 'Welcome to CurePulse Dashboard.',
    details: 'Your user profile has been provisioned successfully. You now have access to medical charts, appointment logs, live queue details, and reports based on your authorized role permissions.',
    time: '1h ago',
    read: false,
    type: 'success'
  },
  {
    id: 'schedule-reminder',
    title: 'Upcoming Appointment Reminder',
    shortDescription: 'Cardiology consultation in 2 hours.',
    details: 'Friendly reminder that your cardiology follow-up with Dr. Sarah Chen is scheduled for today. Please check in at least 15 minutes prior to your time slot.',
    time: '2h ago',
    read: true,
    type: 'warning'
  }
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAsUnread = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      time: 'Just now',
      read: false,
      shortDescription: notification.shortDescription || notification.message || '',
      details: notification.details || notification.message || '',
      type: notification.type || 'info'
    };
    setNotifications(prev => [newNotification, ...prev]);
    toast.success(notification.title);
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      clearAllNotifications,
      addNotification,
      deleteNotification
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
