import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  alert: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration (default 4 seconds)
    const duration = notification.duration ?? 4000;
    setTimeout(() => {
      hideNotification(id);
    }, duration);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const alert = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (Platform.OS === 'web') {
      // Use our custom notification system for web
      showNotification({ title, message, type });
    } else {
      // Use native Alert for mobile
      Alert.alert(title, message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
        alert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}